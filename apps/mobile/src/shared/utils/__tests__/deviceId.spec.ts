import * as SecureStore from 'expo-secure-store';

import { getOrCreateDeviceId } from '../deviceId';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('getOrCreateDeviceId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the persisted id without generating a new one when one already exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('existing-id');

    const result = await getOrCreateDeviceId();

    expect(result).toBe('existing-id');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('generates and persists a new id when none exists yet', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await getOrCreateDeviceId();

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('device_id', result);
  });
});
