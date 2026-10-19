import {
  STORY_IMAGE_MAX_PIXELS,
  STORY_IMAGE_MAX_SIDE,
  type StoryImageType,
} from '../stories.constants';

export interface ProbedImage {
  type: StoryImageType;
  width: number;
  height: number;
}

/**
 * Reads a photo's real type and size from the start of the file (its magic
 * bytes and header), never from what the client said. Supports JPEG, PNG and
 * WebP; anything else, or a header that can't be read, is null.
 */
export function probeImage(buf: Buffer): ProbedImage | null {
  return probePng(buf) ?? probeJpeg(buf) ?? probeWebp(buf);
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function probePng(buf: Buffer): ProbedImage | null {
  // Signature, then the IHDR chunk: length(4) "IHDR" width(4) height(4)
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return null;
  }
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return sized('image/png', buf.readUInt32BE(16), buf.readUInt32BE(20));
}

// Start-of-frame markers that carry the size (not DHT C4, JPG C8, DAC CC)
const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function probeJpeg(buf: Buffer): ProbedImage | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 4 <= buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    // Fill bytes between segments
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    // Markers without a length
    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }
    // Start of scan / end of image before any frame header
    if (marker === 0xda || marker === 0xd9) return null;
    const length = buf.readUInt16BE(offset + 2);
    if (length < 2) return null;
    if (SOF_MARKERS.has(marker)) {
      // length(2) precision(1) height(2) width(2)
      if (offset + 9 > buf.length) return null;
      return sized(
        'image/jpeg',
        buf.readUInt16BE(offset + 7),
        buf.readUInt16BE(offset + 5),
      );
    }
    offset += 2 + length;
  }
  return null;
}

function probeWebp(buf: Buffer): ProbedImage | null {
  if (
    buf.length < 30 ||
    buf.toString('ascii', 0, 4) !== 'RIFF' ||
    buf.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    return null;
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    // Key frame start code, then 14-bit width / height
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return sized(
      'image/webp',
      buf.readUInt16LE(26) & 0x3fff,
      buf.readUInt16LE(28) & 0x3fff,
    );
  }
  if (chunk === 'VP8L') {
    if (buf[20] !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return sized(
      'image/webp',
      (bits & 0x3fff) + 1,
      ((bits >> 14) & 0x3fff) + 1,
    );
  }
  if (chunk === 'VP8X') {
    // 24-bit canvas width / height minus one
    return sized(
      'image/webp',
      buf.readUIntLE(24, 3) + 1,
      buf.readUIntLE(27, 3) + 1,
    );
  }
  return null;
}

function sized(
  type: StoryImageType,
  width: number,
  height: number,
): ProbedImage | null {
  if (width < 1 || height < 1) return null;
  return { type, width, height };
}

/**
 * Why a photo's size is not acceptable, or null when it is. Each side is
 * checked before multiplying, so the product never exceeds 8192² and stays
 * a safe integer.
 */
export function dimensionProblem(
  width: number,
  height: number,
): 'invalid_dimensions' | 'too_large' | null {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return 'invalid_dimensions';
  }
  if (width > STORY_IMAGE_MAX_SIDE || height > STORY_IMAGE_MAX_SIDE) {
    return 'too_large';
  }
  if (width * height > STORY_IMAGE_MAX_PIXELS) return 'too_large';
  return null;
}
