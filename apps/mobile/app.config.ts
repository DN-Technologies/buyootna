import type { ExpoConfig } from 'expo/config';

// The same wording for every plugin that writes these iOS permission texts
// (image picker, audio, story camera): whichever is applied last wins
const CAMERA_PERMISSION =
  'يحتاج التطبيق إلى الكاميرا لالتقاط صور وفيديوهات قصصك، وإرسال الصور في المحادثة، وإضافتها إلى إعلانك';
const MICROPHONE_PERMISSION =
  'يحتاج التطبيق إلى الميكروفون لتسجيل صوت فيديوهات قصصك والرسائل الصوتية في المحادثة';

const PRODUCTION_API_URL = 'https://api.buyootna.cloud';
const LOCAL_API_URL_PATTERN = /localhost|127\.0\.0\.1|10\.0\.2\.2/;

// Guards against exactly what happened before: EXPO_PUBLIC_API_URL left
// pointed at a local API in apps/mobile/.env, then baked into a real build.
// This file is evaluated on every single Expo/EAS CLI invocation (start,
// prebuild, run, build) -- both locally and inside EAS's cloud build
// servers -- so it's the one choke point that covers every path, no matter
// who or what triggers the build.
//
// EAS cloud builds already resolve EXPO_PUBLIC_API_URL from the build
// profile's own `env` in eas.json (confirmed: its log explicitly states
// the profile config wins over both .env and the EAS dashboard's
// "Environments" values), never from the local .env file -- so this can
// only ever fire for a genuinely local invocation.
function checkApiUrl(): void {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl || !LOCAL_API_URL_PATTERN.test(apiUrl)) {
    return;
  }

  const banner = [
    '',
    '⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️',
    `  EXPO_PUBLIC_API_URL is set to a LOCAL address: ${apiUrl}`,
    '  This must point to the real API before shipping a build or demoing to anyone.',
    `  Fix: apps/mobile/.env -> EXPO_PUBLIC_API_URL=${PRODUCTION_API_URL}`,
    '⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️',
    '',
  ].join('\n');
  console.warn(banner);

  // Hard-fail only for commands that actually produce a distributable
  // artifact (a real device/simulator install, or a build) -- not
  // `expo start`, which only serves JS to an already-installed dev client
  // and is trivially fixed by pointing .env at the right URL and reloading.
  const isBuildCommand = process.argv.some((arg) =>
    ['run:ios', 'run:android', 'build', 'prebuild'].includes(arg),
  );
  if (isBuildCommand && !process.env.ALLOW_LOCAL_API_URL) {
    throw new Error(
      `Refusing to build with EXPO_PUBLIC_API_URL="${apiUrl}" (a local address). ` +
        `Set EXPO_PUBLIC_API_URL to ${PRODUCTION_API_URL} in apps/mobile/.env first, ` +
        `or set ALLOW_LOCAL_API_URL=1 to intentionally override this check.`,
    );
  }
}

checkApiUrl();

const config: ExpoConfig = {
  name: 'Buyootna',
  slug: 'buyootna',
  version: '1.7.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: 'buyootnamobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.buyootna.app',
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'يستخدم التطبيق موقعك الجغرافي لتحديد مكانك وعرض العقارات والخدمات القريبة منك على الخريطة.',
      CFBundleLocalizations: ['ar', 'en'],
      CFBundleDevelopmentRegion: 'ar',
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './src/assets/images/android-icon-foreground.png',
      backgroundImage: './src/assets/images/android-icon-background.png',
      monochromeImage: './src/assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.constyoussef.buyootna.login',
    // Firebase config for FCM, which delivers Android push notifications
    // (expo-notifications). Client config only -- the FCM service-account
    // key lives in EAS credentials, never in the repo.
    googleServicesFile: './google-services.json',
  },
  web: {
    output: 'static',
    favicon: './src/assets/images/favicon.png',
  },
  plugins: [
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.104779825495-f3h8u785nsrrodidi3k61ndknbs76i9l',
      },
    ],
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsImpl: 'mapbox',
      },
    ],
    'expo-router',
    [
      'expo-notifications',
      {
        // Android status-bar icon must be a white-on-transparent silhouette
        icon: './src/assets/images/android-icon-monochrome.png',
        color: '#15304D',
        // The chat message tone (pushes name it; Android plays it through
        // the "chat-messages" channel created in usePushRegistration)
        sounds: ['./src/assets/sounds/buyootna_message.wav'],
      },
    ],
    './plugins/withPrebuiltDsyms',
    './plugins/withRtlFlags',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        organization: 'buyootna',
        project: 'buyootna-mobile',
      },
    ],
    [
      'expo-splash-screen',
      {
        // Plain navy, the first frame of the launch animation
        // (src/assets/animations/launch.json). Transparent rather than no
        // image: Android 12+ would otherwise show the app icon.
        image: './src/assets/images/splash-blank.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0B2239',
        dark: {
          backgroundColor: '#0B2239',
        },
      },
    ],
    'expo-font',
    'expo-web-browser',
    '@react-native-community/datetimepicker',
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission: 'يحتاج التطبيق للوصول إلى صورك لإضافتها إلى إعلانك',
        cameraPermission:
          CAMERA_PERMISSION,
        microphonePermission:
          MICROPHONE_PERMISSION,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission:
          MICROPHONE_PERMISSION,
      },
    ],
    'expo-video',
    [
      // The in-app story camera (full-screen 9:16, tap for a photo, hold
      // for a video)
      'expo-camera',
      {
        cameraPermission:
          CAMERA_PERMISSION,
        microphonePermission:
          MICROPHONE_PERMISSION,
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'يستخدم التطبيق موقعك الجغرافي لتحديد مكانك وعرض العقارات والخدمات القريبة منك على الخريطة.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/8c909bc9-87c4-4996-bf82-12f7759cc30a',
    // The app already drives its own update check/fetch in src/app/index.tsx
    // (with tight timeouts and visible-only-when-a-real-update-exists UI) --
    // disabling the native module's own automatic check here avoids a
    // second, uncontrolled network round-trip racing it on every cold launch.
    checkAutomatically: 'NEVER',
  },
  extra: {
    router: {},
    eas: {
      projectId: '8c909bc9-87c4-4996-bf82-12f7759cc30a',
    },
  },
};

export default config;
