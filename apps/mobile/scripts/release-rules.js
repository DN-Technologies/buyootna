'use strict';

/**
 * Deterministic OTA-release classification rules for apps/mobile.
 *
 * Every changed file (path relative to apps/mobile/) is classified as one of:
 *   - OTA_SAFE       deployable via `eas update`
 *   - NATIVE_REQUIRED  needs a new native build/submission
 *   - AMBIGUOUS       cannot be confidently decided by these rules; ask a human
 *
 * Precedence when aggregating multiple files: NATIVE_REQUIRED > AMBIGUOUS > OTA_SAFE.
 * See docs/OTA_RELEASE_WORKFLOW.md for the reasoning behind each bucket.
 */

const NATIVE_REQUIRED = 'NATIVE_REQUIRED';
const AMBIGUOUS = 'AMBIGUOUS';
const OTA_SAFE = 'OTA_SAFE';

const RANK = { [OTA_SAFE]: 0, [AMBIGUOUS]: 1, [NATIVE_REQUIRED]: 2 };

// Checked in order; first match wins.
const NATIVE_FILE_PATTERNS = [
  [/^ios\//, 'Native iOS project file'],
  [/^android\//, 'Native Android project file'],
  [/^plugins\//, 'Expo config plugin (runs at prebuild/native-build time)'],
  [/^app\.config\.(ts|js)$/, 'Expo app config (permissions, native plugins, bundle identifiers, etc.)'],
  [/^app\.json$/, 'Expo app config (permissions, native plugins, bundle identifiers, etc.)'],
  [/Podfile(\.lock)?$/, 'CocoaPods dependency file'],
  [/\.pbxproj$/, 'Xcode project file'],
  [/Info\.plist$/, 'iOS Info.plist'],
  [/AndroidManifest\.xml$/, 'Android manifest'],
];

const AMBIGUOUS_FILE_PATTERNS = [
  [/^eas\.json$/, 'EAS build/update configuration (channels, build-time env vars)'],
  [/^babel\.config\.js$/, 'Babel config (can affect what native code gets compiled in, e.g. Reanimated plugin)'],
  [/^metro\.config\.js$/, 'Metro bundler config'],
];

const OTA_SAFE_FILE_PATTERNS = [
  [/^src\//, 'Application source (JS/TS logic, components, screens, styles, assets)'],
  [/^__mocks__\//, 'Test mocks'],
  [/^scripts\//, 'Dev tooling script (not shipped in the app bundle)'],
  [/^\.maestro\//, 'E2E test spec (not shipped in the app bundle)'],
  [/^tsconfig\.json$/, 'TypeScript config (dev-time only)'],
  [/^eslint\.config\.js$/, 'Lint config (dev-time only)'],
  [/^\.prettierrc$/, 'Formatter config (dev-time only)'],
  [/^jest\.config\.js$/, 'Test config (dev-time only)'],
  [/^tailwind\.config\.js$/, 'Tailwind/NativeWind config (affects bundled JS styling only)'],
  [/^postcss\.config\.js$/, 'PostCSS config (web build tooling only)'],
  [/^(README|VERSIONING)\.md$/, 'Documentation'],
];

// Packages known to be pure JS/TS with no native module and no config-plugin behavior.
const SAFE_JS_PACKAGES = new Set([
  'axios',
  'zod',
  'zustand',
  'react-hook-form',
  '@hookform/resolvers',
  '@tanstack/react-query',
  'socket.io-client',
  'tailwindcss',
  'postcss',
  'nativewind',
  'eslint',
  'eslint-config-expo',
  'eslint-plugin-simple-import-sort',
  'prettier',
  'prettier-plugin-tailwindcss',
  'typescript',
  'jest',
  'jest-expo',
  'metro-runtime',
  'react-test-renderer',
  '@testing-library/react-native',
  '@testing-library/jest-native',
]);

// Packages known to ship native code, a config plugin, or otherwise affect the
// native runtime. Conservative on purpose: prefixes catch the whole family.
const NATIVE_PACKAGE_PATTERN =
  /^(react-native(-|$)|@react-native\/|@react-native-|expo(-|$)|@expo\/|@expo-google-fonts\/|@rnmapbox\/|@sentry\/react-native|@gorhom\/|@shopify\/flash-list$)/;

function classifyFile(relPath) {
  for (const [pattern, reason] of NATIVE_FILE_PATTERNS) {
    if (pattern.test(relPath)) return { classification: NATIVE_REQUIRED, reason };
  }
  for (const [pattern, reason] of AMBIGUOUS_FILE_PATTERNS) {
    if (pattern.test(relPath)) return { classification: AMBIGUOUS, reason };
  }
  if (relPath === 'package.json') {
    // package.json itself is special-cased by classifyDependencyChanges; this
    // branch only fires if that special-casing couldn't run.
    return { classification: AMBIGUOUS, reason: 'Dependency manifest changed; could not analyze the diff' };
  }
  for (const [pattern, reason] of OTA_SAFE_FILE_PATTERNS) {
    if (pattern.test(relPath)) return { classification: OTA_SAFE, reason };
  }
  return { classification: AMBIGUOUS, reason: 'File type not recognized by the release-rules classifier' };
}

function classifyDependency(name) {
  if (name.startsWith('@types/')) {
    return { classification: OTA_SAFE, reason: 'Type-only package' };
  }
  if (SAFE_JS_PACKAGES.has(name)) {
    return { classification: OTA_SAFE, reason: 'Known pure JS/TS package' };
  }
  if (NATIVE_PACKAGE_PATTERN.test(name)) {
    return { classification: NATIVE_REQUIRED, reason: 'Known to ship native code or a config plugin' };
  }
  return { classification: AMBIGUOUS, reason: 'Unrecognized package; native-code status unknown' };
}

function worse(a, b) {
  return RANK[a] >= RANK[b] ? a : b;
}

module.exports = {
  OTA_SAFE,
  NATIVE_REQUIRED,
  AMBIGUOUS,
  classifyFile,
  classifyDependency,
  worse,
};
