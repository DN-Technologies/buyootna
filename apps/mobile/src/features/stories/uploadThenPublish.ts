import type { StoryUploadTarget } from './types';

interface Slot {
  uploadUrlExpiresAt: string;
  media: StoryUploadTarget;
  poster?: StoryUploadTarget;
}

const errorCode = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * What stories and reels share: an upload slot, the files straight to S3 (a
 * poster first, then the file, whose progress is reported), then publish (the
 * server checks the files). A failed upload is retried once with the same
 * links while they are valid, otherwise with a new slot; a publish that finds
 * the files not there yet is retried once.
 */
export async function uploadThenPublish<S extends Slot, Result>({
  createSlot,
  put,
  mediaUri,
  posterUri,
  publish,
  incompleteCode,
  uploadError,
  onProgress,
  now = Date.now,
}: {
  createSlot: () => Promise<S>;
  put: (
    target: StoryUploadTarget,
    fileUri: string,
    onProgress?: (fraction: number) => void,
  ) => Promise<number>;
  mediaUri: string;
  // Given: the slot must have a poster link, and it goes first
  posterUri?: string;
  publish: (slot: S) => Promise<Result>;
  // The code the server answers while the files aren't there yet
  incompleteCode: string;
  uploadError: (status: number) => Error;
  onProgress?: (fraction: number) => void;
  now?: () => number;
}): Promise<Result> {
  const ok = (status: number) => status >= 200 && status < 300;
  const safePut = (...args: Parameters<typeof put>) =>
    put(...args).catch(() => 0);
  const upload = async (slot: S): Promise<number> => {
    if (posterUri) {
      if (!slot.poster) return 0;
      const posterStatus = await safePut(slot.poster, posterUri);
      if (!ok(posterStatus)) return posterStatus;
    }
    return safePut(slot.media, mediaUri, onProgress);
  };

  let slot = await createSlot();
  let status = await upload(slot);
  if (!ok(status)) {
    if (Date.parse(slot.uploadUrlExpiresAt) <= now()) {
      slot = await createSlot();
    }
    status = await upload(slot);
  }
  if (!ok(status)) throw uploadError(status);

  const published = slot;
  try {
    return await publish(published);
  } catch (error) {
    if (errorCode(error) !== incompleteCode) throw error;
    await delay(1000);
    return publish(published);
  }
}
