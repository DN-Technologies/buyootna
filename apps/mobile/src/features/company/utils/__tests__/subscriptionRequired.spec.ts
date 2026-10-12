import { Platform } from 'react-native';

import { promptSubscription } from '../subscriptionRequired';

const mockShowAlert = jest.fn();
jest.mock('@/shared/utils/alert', () => ({
  showAlert: (...args: unknown[]) => mockShowAlert(...args),
}));

function promptOn(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
  mockShowAlert.mockClear();
  promptSubscription({ push: jest.fn() } as never);
  const [title, message] = mockShowAlert.mock.calls[0] as [string, string];
  return `${title} ${message}`;
}

describe('promptSubscription', () => {
  const original = Platform.OS;
  afterAll(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: original,
    });
  });

  it('asks the company to subscribe on Android', () => {
    expect(promptOn('android')).toContain('اشترك');
  });

  it('never mentions subscribing on iOS', () => {
    const text = promptOn('ios');
    expect(text).toContain('انتهت باقة شركتك');
    expect(text).not.toMatch(/اشترك|الاشتراك|شراء/);
  });
});
