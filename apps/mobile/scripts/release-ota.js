#!/usr/bin/env node
'use strict';

/**
 * The ONLY place in this repo that is allowed to run `eas update`.
 *
 * This is a deliberate, manual command -- it is never invoked automatically
 * by the pre-push hook or by release-analysis.js. Detection (is this change
 * OTA-safe?) and deployment (actually publishing) are separate steps.
 *
 * Usage:
 *   pnpm --filter buyootna release:ota -- --channel production --message "Fix login validation"
 *
 * --channel defaults to "production". --message is required.
 */

const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const args = { channel: 'production', message: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--channel') args.channel = argv[++i];
    else if (argv[i] === '--message') args.message = argv[++i];
  }
  return args;
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const { channel, message } = parseArgs(process.argv.slice(2));

  if (!message) {
    console.error('Error: --message "<description>" is required.');
    console.error('Example: pnpm --filter buyootna release:ota -- --message "Fix login validation"');
    process.exit(1);
  }

  console.log('');
  console.log('━'.repeat(38));
  console.log('        OTA Publish Checklist');
  console.log('━'.repeat(38));

  // 1. Verify git working tree is clean.
  const status = git(['status', '--porcelain']);
  if (status) {
    console.log('✗ Working tree is not clean:');
    console.log(status);
    console.log('Commit or stash your changes before publishing an OTA update.');
    process.exit(1);
  }
  console.log('✓ Working tree is clean');

  // 2. Show the commit(s) about to be published.
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = git(['log', '-1', '--oneline']);
  console.log(`✓ Current branch: ${branch}`);
  console.log(`✓ HEAD commit: ${head}`);

  // 3. Verify runtime compatibility (runtimeVersion policy = appVersion).
  const configPath = path.join(__dirname, '..', 'app.config.ts');
  const configSrc = fs.readFileSync(configPath, 'utf8');
  const versionMatch = configSrc.match(/version:\s*'([^']+)'/);
  const appVersion = versionMatch ? versionMatch[1] : '(unknown)';
  console.log(`✓ Runtime version target (policy: appVersion): ${appVersion}`);
  console.log('  This update will only reach installed binaries whose embedded runtimeVersion');
  console.log(`  already equals "${appVersion}". If no native build with this version has been`);
  console.log('  released yet, this update will not reach any real users.');

  // 4. Verify EAS project.
  const projectIdMatch = configSrc.match(/projectId:\s*'([^']+)'/);
  const projectId = projectIdMatch ? projectIdMatch[1] : '(unknown)';
  const whoami = spawnSync('eas', ['whoami'], { encoding: 'utf8' });
  const account = whoami.status === 0 ? whoami.stdout.trim() : '(could not determine -- are you logged in? `eas login`)';
  console.log(`✓ EAS project ID: ${projectId}`);
  console.log(`✓ EAS account: ${account}`);

  // 5. Verify channel.
  console.log(`✓ Target channel: ${channel}`);
  console.log(`✓ Message: "${message}"`);

  // 6. Force the same runtime env eas.json's matching build profile uses,
  // overriding whatever is in the local shell/.env.
  //
  // Unlike `eas build`, `eas update` does NOT read eas.json's build-profile
  // `env` block at all -- it just re-bundles JS using whatever the invoking
  // shell/.env already has. Locally that's deliberately EXPO_PUBLIC_API_URL
  // pointed at localhost for day-to-day dev work, which means a plain `eas
  // update` run silently ships a bundle wired to talk to the developer's
  // own laptop instead of the real API -- indistinguishable from a real
  // update to every device that installs it (the app never crashes, it just
  // can never successfully reach the server, forever, until reinstalled).
  // This shipped to production undetected multiple times before this check
  // existed. Force-matching the build profile's env here is the fix.
  const easJsonPath = path.join(__dirname, '..', 'eas.json');
  const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
  const buildProfileEnv = easJson.build?.[channel]?.env ?? {};

  // Strip EVERY EXPO_PUBLIC_* value the local shell/.env carries, not just
  // the ones this script happens to know are risky. Overriding individual
  // known keys (as an earlier version of this script did for
  // EXPO_PUBLIC_API_URL alone) is a whack-a-mole fix -- it caught the
  // localhost API URL leak, but not EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS,
  // which is =true in .env for local feat/companies dev work and would
  // otherwise leak into a real publish and unlock company accounts for
  // every production user. The build profile's own `env` block in
  // eas.json is the one authoritative source for what a real build (and
  // now an OTA update) should ship with -- anything local not in there
  // gets dropped entirely rather than silently inherited.
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('EXPO_PUBLIC_')),
  );
  const droppedKeys = Object.keys(process.env).filter(
    (key) => key.startsWith('EXPO_PUBLIC_') && !(key in buildProfileEnv),
  );
  if (droppedKeys.length > 0) {
    console.log(`✓ Dropped local-only env vars not in build.${channel}.env: ${droppedKeys.join(', ')}`);
  }

  const LOCAL_API_URL_PATTERN = /localhost|127\.0\.0\.1|10\.0\.2\.2/;
  const resolvedApiUrl = buildProfileEnv.EXPO_PUBLIC_API_URL;

  if (!resolvedApiUrl || LOCAL_API_URL_PATTERN.test(resolvedApiUrl)) {
    console.log(
      `✗ eas.json's build.${channel}.env has no safe EXPO_PUBLIC_API_URL (got "${resolvedApiUrl}").`,
    );
    console.log('  Refusing to publish an OTA update that would break every device that installs it.');
    process.exit(1);
  }
  console.log(
    `✓ Runtime env forced to match eas.json's build.${channel} profile (EXPO_PUBLIC_API_URL: ${resolvedApiUrl})`,
  );

  console.log('━'.repeat(38));
  console.log('');
  console.log(`About to run: eas update --channel ${channel} --message "${message}"`);
  const answer = await ask('Type PUBLISH to confirm, anything else to abort: ');
  if (answer !== 'PUBLISH') {
    console.log('Aborted. Nothing was published.');
    process.exit(1);
  }

  // Bake the release message (and the commit it shipped from) into the
  // published JS bundle itself, via the same EXPO_PUBLIC_* mechanism this
  // project already uses for build-time config. eas update re-bundles JS
  // using the current environment, so these become readable at runtime by
  // app code (see the About screen) -- giving QA a human-readable "what
  // changed" without needing EAS dashboard/git access, while the native
  // app `version` stays untouched so this OTA push keeps reaching the
  // current runtime.
  const shortSha = git(['rev-parse', '--short', 'HEAD']);
  // --clear-cache: Metro's bundler cache doesn't key on *values* of inlined
  // EXPO_PUBLIC_* env vars, only on source file content + transform config
  // -- so a plain re-run can silently reuse a bundle output built under a
  // previous env (exactly how localhost:8000 kept shipping even after the
  // env override above was added and confirmed correct). Without this flag
  // that override is necessary but not sufficient.
  const result = spawnSync(
    'eas',
    ['update', '--channel', channel, '--message', message, '--clear-cache'],
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...cleanEnv,
        ...buildProfileEnv,
        EXPO_PUBLIC_OTA_RELEASE_NOTE: message,
        EXPO_PUBLIC_OTA_COMMIT: shortSha,
      },
    },
  );
  process.exit(result.status ?? 1);
}

main();
