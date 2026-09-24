import { Linking } from 'react-native';

import {
  openUrlThrottled,
  resetLinkThrottle,
} from '../openUrl';

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

const openURL = Linking.openURL as jest.Mock;

describe('openUrlThrottled', () => {
  beforeEach(() => {
    resetLinkThrottle();
    openURL.mockReset();
    openURL.mockResolvedValue(true);
  });

  it('opens a first URL immediately', async () => {
    await expect(openUrlThrottled('tel:+96512345678')).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledWith('tel:+96512345678');
  });

  it('swallows a rapid second tap on the same link', async () => {
    await openUrlThrottled('tel:+96512345678');
    await expect(openUrlThrottled('tel:+96512345678')).resolves.toBe(false);
    expect(openURL).toHaveBeenCalledTimes(1);
  });

  it('swallows a rapid tap on a different link too (burst lock)', async () => {
    await openUrlThrottled('tel:+96512345678');
    await expect(openUrlThrottled('https://wa.me/+96512345678')).resolves.toBe(
      false,
    );
    expect(openURL).toHaveBeenCalledTimes(1);
  });

  it('opens the same link again after the dedupe window', async () => {
    await openUrlThrottled('tel:+96512345678');
    resetLinkThrottle();
    await expect(openUrlThrottled('tel:+96512345678')).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledTimes(2);
  });

  it('rejects like Linking.openURL when a real open fails, so fallbacks still fire', async () => {
    openURL.mockRejectedValueOnce(new Error('cannot open'));
    await expect(openUrlThrottled('whatsapp://send?phone=123')).rejects.toThrow(
      'cannot open',
    );
  });

  it('a swallowed call never rejects (no accidental fallback cascade)', async () => {
    await openUrlThrottled('whatsapp://send?phone=123');
    await expect(
      openUrlThrottled('whatsapp://send?phone=123'),
    ).resolves.toBe(false);
  });
});
