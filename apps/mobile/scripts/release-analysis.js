#!/usr/bin/env node
'use strict';

/**
 * Advisory, read-only release analysis for apps/mobile.
 *
 * Invoked by .husky/pre-push (once per pushed ref) with:
 *   node release-analysis.js <local_sha> <remote_sha> <branch>
 *
 * Can also be run manually for testing:
 *   node scripts/release-analysis.js               (compares HEAD against its upstream)
 *   node scripts/release-analysis.js <sha>..<sha>   (explicit range)
 *
 * This script NEVER publishes an OTA update and NEVER fails the push it was
 * invoked from -- any unexpected error is caught and reported as a warning
 * so `git push` is never blocked by this tool. Detection and deployment are
 * intentionally separate: see scripts/release-ota.js for actual publishing.
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const readline = require('node:readline');

const rules = require('./release-rules');

const ZERO_SHA = '0'.repeat(40);
const MOBILE_PREFIX = 'apps/mobile/';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function tryGit(args, fallback) {
  try {
    return git(args);
  } catch {
    return fallback;
  }
}

function resolveRange() {
  const argv = process.argv.slice(2);

  if (argv.length >= 3) {
    // Hook mode: <local_sha> <remote_sha> <branch>
    const [localSha, remoteSha] = argv;
    if (localSha === ZERO_SHA) return null; // branch deletion, nothing to analyze
    if (!remoteSha || remoteSha === ZERO_SHA) {
      // New branch: try to diff against a sensible base, else just the last commit.
      const base =
        tryGit(['merge-base', 'origin/dev', localSha], null) ||
        tryGit(['merge-base', 'origin/main', localSha], null);
      if (base) return `${base}..${localSha}`;
      const parent = tryGit(['rev-parse', `${localSha}^`], null);
      return parent ? `${parent}..${localSha}` : localSha;
    }
    return `${remoteSha}..${localSha}`;
  }

  if (argv.length === 1) return argv[0]; // manual mode: explicit range

  // Manual mode, no args: compare HEAD against its upstream.
  const upstream = tryGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], null);
  return upstream ? `${upstream}..HEAD` : 'HEAD~1..HEAD';
}

function changedFiles(range) {
  const out = range.includes('..')
    ? tryGit(['diff', '--name-only', range], '')
    : tryGit(['show', '--name-only', '--format=', range], '');
  return out ? out.split('\n').filter(Boolean) : [];
}

function commitList(range) {
  const out = range.includes('..')
    ? tryGit(['log', '--oneline', range], '')
    : tryGit(['log', '--oneline', '-1', range], '');
  return out ? out.split('\n').filter(Boolean) : [];
}

function readJsonAt(ref, path) {
  try {
    return JSON.parse(git(['show', `${ref}:${path}`]));
  } catch {
    return null;
  }
}

function rangeEndpoints(range) {
  if (!range.includes('..')) {
    const parent = tryGit(['rev-parse', `${range}^`], null);
    return { oldRef: parent, newRef: range };
  }
  const [oldRef, newRef] = range.split('..');
  return { oldRef, newRef };
}

function classifyDependencyChanges(range) {
  const { oldRef, newRef } = rangeEndpoints(range);
  const oldPkg = oldRef && readJsonAt(oldRef, `${MOBILE_PREFIX}package.json`);
  const newPkg = readJsonAt(newRef, `${MOBILE_PREFIX}package.json`);
  if (!newPkg) {
    return [{ classification: rules.AMBIGUOUS, detail: 'package.json', reason: 'Could not read package.json' }];
  }
  if (!oldPkg) {
    return [
      {
        classification: rules.AMBIGUOUS,
        detail: 'package.json',
        reason: 'No prior version of package.json to diff against',
      },
    ];
  }

  const results = [];
  for (const field of ['dependencies', 'devDependencies']) {
    const before = oldPkg[field] || {};
    const after = newPkg[field] || {};
    const names = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const name of names) {
      if (before[name] === after[name]) continue;
      const { classification, reason } = rules.classifyDependency(name);
      const change = !(name in before)
        ? `added ${after[name]}`
        : !(name in after)
          ? `removed (was ${before[name]})`
          : `${before[name]} -> ${after[name]}`;
      results.push({ classification, detail: `${name} (${change})`, reason });
    }
  }
  return results;
}

function analyze(range) {
  const files = changedFiles(range).filter((f) => f.startsWith(MOBILE_PREFIX));
  if (files.length === 0) return null;

  const findings = [];
  let overall = rules.OTA_SAFE;

  for (const file of files) {
    const relPath = file.slice(MOBILE_PREFIX.length);
    if (relPath === 'package.json') {
      const depResults = classifyDependencyChanges(range);
      if (depResults.length === 0) {
        findings.push({ file, classification: rules.OTA_SAFE, reason: 'No dependency changes (e.g. scripts only)' });
      } else {
        for (const d of depResults) {
          findings.push({ file: `${file} :: ${d.detail}`, classification: d.classification, reason: d.reason });
          overall = rules.worse(overall, d.classification);
        }
      }
      continue;
    }
    const { classification, reason } = rules.classifyFile(relPath);
    findings.push({ file, classification, reason });
    overall = rules.worse(overall, classification);
  }

  return { files, findings, overall, commits: commitList(range) };
}

const MARK = {
  [rules.OTA_SAFE]: '✓',
  [rules.NATIVE_REQUIRED]: '⚠',
  [rules.AMBIGUOUS]: '?',
};

const LINE = '━'.repeat(38);

function printReport(result) {
  console.log('');
  console.log(LINE);
  console.log('        Release Analysis');
  console.log(LINE);
  console.log('Commits:');
  for (const c of result.commits) console.log(`  ${c}`);
  console.log('Changed:');
  for (const f of result.findings) {
    console.log(`  ${MARK[f.classification]} ${f.file}`);
  }
  console.log('Classification:');
  console.log(`  ${MARK[result.overall]} ${result.overall}`);
  console.log('Reason:');
  const uniqueReasons = [...new Set(result.findings.map((f) => `${f.classification}: ${f.reason}`))];
  for (const r of uniqueReasons) console.log(`  - ${r}`);
  console.log(LINE);
}

function openTty() {
  try {
    const fd = fs.openSync('/dev/tty', 'r+');
    return fd;
  } catch {
    return null;
  }
}

function promptOtaSafe(callback) {
  const fd = openTty();
  if (fd === null) {
    console.log('(non-interactive shell -- skipping confirmation prompt)');
    console.log('When ready, publish manually with: pnpm --filter buyootna release:ota -- --message "<message>"');
    callback();
    return;
  }
  const ttyStream = fs.createReadStream(null, { fd });
  const rl = readline.createInterface({ input: ttyStream, output: process.stdout, terminal: true });
  console.log('Would you like to publish this commit as an OTA update?');
  console.log('[1] Yes  - Publish OTA');
  console.log('[2] No   - Don\'t publish now');
  console.log('[3] No   - This belongs to a new app version');
  rl.question('> ', (answer) => {
    rl.close();
    fs.closeSync(fd);
    const choice = answer.trim();
    if (choice === '1') {
      console.log('');
      console.log('Noted. Detection and deployment are separate steps -- this hook never publishes.');
      console.log('After the push completes, run the dedicated publish command yourself:');
      console.log('  pnpm --filter buyootna release:ota -- --message "<describe this update>"');
      console.log('That command runs its own pre-publish checklist and asks for final confirmation.');
    } else if (choice === '3') {
      console.log('');
      console.log('Understood -- treating this as part of a future app version, not an OTA release.');
      console.log('See apps/mobile/VERSIONING.md for how to compute the next version/build number.');
    } else {
      console.log('');
      console.log('OK -- not publishing now.');
    }
    callback();
  });
}

function main() {
  const range = resolveRange();
  if (!range) return; // branch deletion or nothing to compare

  const result = analyze(range);
  if (!result) return; // push doesn't touch apps/mobile at all

  printReport(result);

  if (result.overall === rules.NATIVE_REQUIRED) {
    console.log('A native dependency/configuration was changed. OTA is NOT recommended.');
    console.log('Recommended: create a new native app version (see apps/mobile/VERSIONING.md).');
    console.log('');
    return;
  }

  if (result.overall === rules.AMBIGUOUS) {
    console.log('I cannot confidently determine whether this change is compatible with the');
    console.log('production runtime. OTA will NOT be published automatically.');
    console.log('');
    return;
  }

  promptOtaSafe(() => {});
}

try {
  main();
} catch (err) {
  console.log(`release-analysis: skipped due to an internal error: ${err && err.message}`);
}
