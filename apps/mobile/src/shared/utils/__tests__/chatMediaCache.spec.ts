import * as FileSystem from 'expo-file-system/legacy';

import {
  cachedImageSource,
  cachedVoiceFile,
  keepVoiceFile,
  stableMediaKey,
} from '../chatMediaCache';

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(),
  downloadAsync: jest.fn(),
  moveAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));

const info = FileSystem.getInfoAsync as jest.Mock;
const download = FileSystem.downloadAsync as jest.Mock;
const first = 'https://bucket.s3.amazonaws.com/chat/c1/a.jpg?X-Amz-Signature=aaa&X-Amz-Date=1';
const second = 'https://bucket.s3.amazonaws.com/chat/c1/a.jpg?X-Amz-Signature=bbb&X-Amz-Date=2';

describe('chat media cache', () => {
  beforeEach(() => jest.clearAllMocks());

  // QA: every reopening of a chat downloaded its photos again -- each load
  // of the messages brings a newly signed link for the same file
  it('keys a photo on its file, not on the signed link', () => {
    expect(stableMediaKey(first)).toBe(stableMediaKey(second));
    expect(cachedImageSource(first)).toEqual({
      uri: first,
      cacheKey: 'https://bucket.s3.amazonaws.com/chat/c1/a.jpg',
    });
    expect(cachedImageSource(second).cacheKey).toBe(cachedImageSource(first).cacheKey);
  });

  it('leaves local files and unsigned links as they are', () => {
    expect(cachedImageSource('file:///tmp/a.jpg')).toEqual({ uri: 'file:///tmp/a.jpg' });
    expect(cachedImageSource('https://cdn/a.jpg')).toEqual({ uri: 'https://cdn/a.jpg' });
  });

  it('finds a voice note kept earlier, whatever the link', async () => {
    info.mockResolvedValue({ exists: true, size: 9000 });
    const a = await cachedVoiceFile(first.replace('a.jpg', 'v.m4a'));
    const b = await cachedVoiceFile(second.replace('a.jpg', 'v.m4a'));

    expect(a).toMatch(/^file:\/\/\/cache\/chat-voice-/);
    expect(b).toBe(a);
  });

  it('has no copy for a note never played, an empty file or a local one', async () => {
    info.mockResolvedValue({ exists: false });
    expect(await cachedVoiceFile(first)).toBeNull();
    info.mockResolvedValue({ exists: true, size: 0 });
    expect(await cachedVoiceFile(first)).toBeNull();
    expect(await cachedVoiceFile('file:///tmp/v.m4a')).toBeNull();
  });

  it('keeps a played note through a temporary file, once', async () => {
    info.mockResolvedValue({ exists: false });
    download.mockResolvedValue({ status: 200 });

    await keepVoiceFile(first);

    const [, partial] = download.mock.calls[0];
    expect(partial).toMatch(/\.part$/);
    expect(FileSystem.moveAsync).toHaveBeenCalledWith({
      from: partial,
      to: partial.replace(/\.part$/, ''),
    });

    info.mockResolvedValue({ exists: true, size: 9000 });
    await keepVoiceFile(second);
    expect(download).toHaveBeenCalledTimes(1);
  });

  it('drops a failed download and never throws', async () => {
    info.mockResolvedValue({ exists: false });
    download.mockResolvedValue({ status: 403 });
    await keepVoiceFile(first);
    expect(FileSystem.moveAsync).not.toHaveBeenCalled();
    expect(FileSystem.deleteAsync).toHaveBeenCalled();

    download.mockRejectedValue(new Error('offline'));
    await expect(keepVoiceFile(first)).resolves.toBeUndefined();
  });
});
