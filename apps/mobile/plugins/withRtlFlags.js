const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

// The app is Arabic-only and unconditionally RTL. RN's I18nManager flags
// aren't persisted on a fresh install, so the very first launch lays out
// LTR (mirrored, broken-looking) and the JS-side forceRTL call only takes
// effect after a restart. This plugin injects the flag writes into
// AppDelegate's didFinishLaunching, BEFORE the root view is created, so
// the app is RTL from the very first frame of the very first launch.
//
// Anchor: unique first statement of didFinishLaunchingWithOptions in the
// Expo SDK 54 AppDelegate template.
const ANCHOR = 'let delegate = ReactNativeDelegate()';
const INJECTION = `// The app is Arabic-only and unconditionally RTL. Persist RN's RTL
    // flags BEFORE the root view is created so a fresh install lays out
    // RTL from the very first frame -- the JS-side I18nManager.forceRTL
    // call only takes effect after a restart, which shipped a mirrored
    // LTR layout to first-time users.
    RCTI18nUtil.sharedInstance().allowRTL(true)
    RCTI18nUtil.sharedInstance().forceRTL(true)

`;

const withRtlFlags = (config) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const appDelegatePath = path.join(
        config.modRequest.platformProjectRoot,
        config.name,
        'AppDelegate.swift',
      );

      let contents = fs.readFileSync(appDelegatePath, 'utf8');
      if (contents.includes('RCTI18nUtil')) {
        // Already injected (idempotent re-runs).
        return config;
      }
      if (!contents.includes(ANCHOR)) {
        throw new Error(
          'withRtlFlags: AppDelegate.swift anchor not found -- the Expo template may have changed; update plugins/withRtlFlags.js',
        );
      }
      contents = contents.replace(ANCHOR, `${INJECTION}${ANCHOR}`);
      fs.writeFileSync(appDelegatePath, contents);
      return config;
    },
  ]);
};

module.exports = withRtlFlags;
