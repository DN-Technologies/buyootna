import * as FileSystem from 'expo-file-system/legacy';

/**
 * Chat files are private: the server signs a new link for each one every
 * time the messages load. The link changes, the file doesn't -- so caches
 * are keyed on the link without its signature, or every reopening of a chat
 * downloaded all its photos and voice notes again (QA).
 */
export function stableMediaKey(url: string): string {
  const cut = url.indexOf('?');
  return cut === -1 ? url : url.slice(0, cut);
}

const isRemote = (url?: string | null): url is string =>
  !!url && /^https?:\/\//.test(url);

/** An expo-image source that reuses the cached file across new links. */
export function cachedImageSource(url: string): { uri: string; cacheKey?: string } {
  return isRemote(url) && url.includes('?')
    ? { uri: url, cacheKey: stableMediaKey(url) }
    : { uri: url };
}

const voiceFile = (url: string) => {
  const name = stableMediaKey(url)
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9.]/g, '_')
    .slice(-150);
  return `${FileSystem.cacheDirectory}chat-voice-${name}`;
};

/** The voice note's copy on this phone, if it was played before. */
export async function cachedVoiceFile(url: string): Promise<string | null> {
  if (!isRemote(url)) return null;
  try {
    const target = voiceFile(url);
    const info = await FileSystem.getInfoAsync(target);
    return info.exists && (info.size ?? 0) > 0 ? target : null;
  } catch {
    return null;
  }
}

const downloading = new Set<string>();

/** Keeps a played voice note on the phone for next time. Best effort. */
export async function keepVoiceFile(url: string): Promise<void> {
  if (!isRemote(url)) return;
  const target = voiceFile(url);
  if (downloading.has(target)) return;
  downloading.add(target);
  try {
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists) return;
    // To a temporary name first: a half-written file must never be played
    const partial = `${target}.part`;
    const result = await FileSystem.downloadAsync(url, partial);
    if (result.status === 200) {
      await FileSystem.moveAsync({ from: partial, to: target });
    } else {
      await FileSystem.deleteAsync(partial, { idempotent: true });
    }
  } catch {
    // Played from the network again next time
  } finally {
    downloading.delete(target);
  }
}
