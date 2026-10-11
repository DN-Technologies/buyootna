/* eslint-disable @typescript-eslint/no-require-imports */

// React Query's default 5-minute garbage-collection timer outlives a test
// file. With Jest running in band (CI runners have few cores) those timers
// kept the process alive ~5 minutes after the last test ("Jest did not exit
// one second after the test run has completed"). Every QueryClient a test
// builds gets gcTime: Infinity, which schedules no timer at all; a test that
// sets its own gcTime keeps it.
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  class TestQueryClient extends actual.QueryClient {
    constructor(config = {}) {
      const defaults = config.defaultOptions ?? {};
      super({
        ...config,
        defaultOptions: {
          ...defaults,
          queries: { gcTime: Infinity, ...defaults.queries },
          mutations: { gcTime: Infinity, ...defaults.mutations },
        },
      });
    }
  }
  return { ...actual, QueryClient: TestQueryClient };
});

// useSafeAreaInsets() throws without a <SafeAreaProvider> ancestor, and
// shared bottom sheets / bottom bars read the bottom inset to stay clear of
// the home indicator. Default it to zero insets for every test (files that
// need specific insets still jest.mock this module themselves).
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// The contact-phone block (edit profiles) and the new-ad phone prefill fetch
// /identities/current/contact-phone on mount. Unmocked, that real request
// could outlive a test file and fail CI with "import after the Jest
// environment has been torn down". Default to "uses the account's phone, no
// number"; files that need specific data jest.mock this module themselves.
jest.mock('@/shared/api/contactPhone.service', () => ({
  contactPhoneService: {
    get: jest.fn(() =>
      Promise.resolve({
        useAccountPhone: true,
        accountPhone: null,
        contactPhone: null,
        contactPhoneVerified: false,
        effectivePhone: null,
      }),
    ),
    requestOtp: jest.fn(() => Promise.resolve({ destination: '' })),
    verify: jest.fn(),
    setUseAccountPhone: jest.fn(),
  },
}));

// Native audio / video (chat voice notes and video tours): no native module
// in Jest. Files that test recording or playback mock these themselves.
jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setAudioModeAsync: jest.fn(async () => {}),
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn(async () => {}),
    record: jest.fn(),
    stop: jest.fn(async () => {}),
    uri: 'file:///voice.m4a',
  })),
  useAudioRecorderState: jest.fn(() => ({ durationMillis: 0, isRecording: false })),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(async () => {}),
    replace: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({
    playing: false,
    currentTime: 0,
    duration: 0,
    didJustFinish: false,
  })),
}));
jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(() => ({ play: jest.fn(), pause: jest.fn() })),
  VideoView: 'VideoView',
}));
jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(async () => ({ uri: 'file:///thumb.jpg' })),
}));

// Reading a chat / notification schedules an app-icon badge sync ~800ms
// later. Left real, that timer outlives the test file and fails CI with
// "Cannot log after tests are done". Default it to a no-op; the badge's own
// spec unmocks this module.
jest.mock('@/shared/hooks/notifications/useAppBadge', () => ({
  ...jest.requireActual('@/shared/hooks/notifications/useAppBadge'),
  scheduleAppBadgeSync: jest.fn(),
  syncAppBadge: jest.fn(async () => {}),
}));
