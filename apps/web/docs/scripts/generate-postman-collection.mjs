// Regenerates public/buyootna-api.postman_collection.json from the live
// OpenAPI spec served by apps/api (@nestjs/swagger, mounted at /api/docs-json
// outside production — see apps/api/src/main.ts).
//
// Usage:
//   1. In another terminal: pnpm --filter api start:dev
//   2. node scripts/generate-postman-collection.mjs
//      (optionally: API_DOCS_URL=http://localhost:8000/api/docs-json node scripts/generate-postman-collection.mjs)
//
// Because this is generated from the actual controllers/DTOs via
// @nestjs/swagger, it always reflects the real API surface — no manual
// re-sync needed after backend changes, just re-run the command above.
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Converter from "openapi-to-postmanv2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specUrl = process.env.API_DOCS_URL ?? "http://localhost:8000/api/docs-json";

// The default token variable name the converter assigns to Bearer-auth
// requests (from the OpenAPI "bearer" security scheme). Renamed below to
// `accessToken` to match the docs site's setup instructions.
const GENERATED_TOKEN_VAR = "bearerToken";
const TOKEN_VAR = "accessToken";

async function main() {
  let spec;
  try {
    const res = await fetch(specUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    spec = await res.text();
  } catch (err) {
    console.error(
      `Could not fetch the OpenAPI spec from ${specUrl}.\n` +
        `Make sure the API dev server is running first: pnpm --filter api start:dev\n` +
        `(Swagger is only mounted when NODE_ENV !== 'production'.)\n\n${err.message}`,
    );
    process.exit(1);
  }

  const result = await new Promise((resolve, reject) => {
    Converter.convert(
      { type: "string", data: spec },
      {
        folderStrategy: "Tags",
        requestParametersResolution: "Example",
        exampleParametersResolution: "Example",
      },
      (err, conversionResult) => (err ? reject(err) : resolve(conversionResult)),
    );
  });

  if (!result.result) {
    console.error("Conversion failed:", result.reason);
    process.exit(1);
  }

  const collection = result.output[0].data;

  // Rename the generated per-request bearer-token variable to `accessToken`
  // throughout the collection, and register it (alongside baseUrl) as a
  // collection variable so it shows up in Postman's Variables tab.
  const raw = JSON.stringify(collection).replaceAll(
    `{{${GENERATED_TOKEN_VAR}}}`,
    `{{${TOKEN_VAR}}}`,
  );
  const finalCollection = JSON.parse(raw);

  if (!finalCollection.variable.some((v) => v.key === TOKEN_VAR)) {
    finalCollection.variable.push({ key: TOKEN_VAR, value: "", type: "string" });
  }
  if (!finalCollection.variable.some((v) => v.key === "baseUrl")) {
    finalCollection.variable.unshift({
      key: "baseUrl",
      value: "http://localhost:8000",
      type: "string",
    });
  }

  // Collection-level auth (cosmetic — every protected request already
  // carries its own copy of this bearer block from the OpenAPI security
  // requirements, but this makes Postman show the collection itself as
  // "using Bearer auth" too).
  finalCollection.auth = {
    type: "bearer",
    bearer: [{ key: "token", value: `{{${TOKEN_VAR}}}`, type: "string" }],
  };

  finalCollection.info.description =
    "Generated from the live OpenAPI spec served by apps/api (@nestjs/swagger) — " +
    "always reflects the real controllers/DTOs, no manual re-sync needed. " +
    `Set {{baseUrl}} and {{${TOKEN_VAR}}} (from POST /auth/login) in the collection variables. ` +
    "Protected requests carry Bearer auth already; public endpoints are explicitly No Auth.";

  const outPath = join(__dirname, "..", "public", "buyootna-api.postman_collection.json");
  writeFileSync(outPath, JSON.stringify(finalCollection, null, 2));

  function countRequests(items) {
    return items.reduce((n, it) => n + (it.item ? countRequests(it.item) : 1), 0);
  }
  console.log(
    `Wrote ${outPath} — ${finalCollection.item.length} folders, ${countRequests(finalCollection.item)} requests.`,
  );
}

main();
