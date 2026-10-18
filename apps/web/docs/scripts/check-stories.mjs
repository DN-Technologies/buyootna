// Checks the QA stories in src/data before they ship: every story id is
// unique, every text field has both English and Arabic, every data file is
// registered in sections.ts, and every data file parses with no object
// holding the same key twice (broken merges of these files have failed the
// docs build three times while this check passed; two stories run together
// keep the second's keys, so one story silently vanished).
// Run: pnpm --filter @buyootna/web-docs check
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data");
const errors = [];

// Load each data file by transpiling it (they only import types). The
// transpiler tolerates syntax errors, so they are reported here instead of
// surfacing only in `next build`
async function load(file) {
  const src = readFileSync(join(dataDir, file), "utf8");
  const { outputText, diagnostics = [] } = ts.transpileModule(src, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  if (diagnostics.length) {
    for (const d of diagnostics) {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
      errors.push(`${file}:${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
    }
    return {};
  }
  // Two stories merged into one object (a lost `}, {`) still transpile, but
  // `next build` refuses the repeated keys
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ES2022, true);
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const seen = new Set();
      for (const prop of node.properties) {
        const key = prop.name && (prop.name.text ?? prop.name.getText(sf));
        if (!key) continue;
        if (seen.has(key)) {
          const { line, character } = sf.getLineAndCharacterOfPosition(prop.getStart(sf));
          errors.push(`${file}:${line + 1}:${character + 1} "${key}" repeated in one object (stories merged together?)`);
        }
        seen.add(key);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  const url = "data:text/javascript," + encodeURIComponent(outputText.replace(/^import .*$/gm, ""));
  return import(url);
}

const sectionsSrc = readFileSync(join(dataDir, "sections.ts"), "utf8");
const ids = new Map();
const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const bothLangs = (v) => v && nonEmpty(v.en) && nonEmpty(v.ar);
const bothLists = (v) =>
  v && Array.isArray(v.en) && Array.isArray(v.ar) && v.en.length > 0 && v.en.length === v.ar.length && [...v.en, ...v.ar].every(nonEmpty);

for (const file of readdirSync(dataDir).filter((f) => f.endsWith(".ts"))) {
  if (["types.ts", "sections.ts", "versions.ts"].includes(file)) continue;
  const mod = await load(file);
  for (const [name, section] of Object.entries(mod)) {
    if (!section?.stories) continue;
    if (!sectionsSrc.includes(`import { ${name} }`)) errors.push(`${file}: ${name} isn't registered in sections.ts`);
    if (!bothLangs(section.title) || !bothLangs(section.summary)) errors.push(`${section.slug}: title/summary missing a language`);
    for (const story of section.stories) {
      const where = `${section.slug} › ${story.id}`;
      if (ids.has(story.id)) errors.push(`${where}: id also used in ${ids.get(story.id)}`);
      ids.set(story.id, section.slug);
      if (!/^[a-z0-9-]+$/.test(story.id)) errors.push(`${where}: id must be kebab-case`);
      if (!["P0", "P1", "P2"].includes(story.priority)) errors.push(`${where}: bad priority`);
      for (const field of ["title", "story"]) if (!bothLangs(story[field])) errors.push(`${where}: ${field} needs en and ar`);
      if (story.endUserStory && !bothLangs(story.endUserStory)) errors.push(`${where}: endUserStory needs en and ar`);
      for (const field of ["acceptanceCriteria", "testScenarios"])
        if (!bothLists(story[field])) errors.push(`${where}: ${field} needs the same number of en and ar items`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in the QA stories:\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${ids.size} stories checked`);
