import { readFileSync } from 'fs';
import { join } from 'path';

import { dimensionProblem, probeImage } from '../utils/image-probe';

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name));

describe('probeImage', () => {
  // Real files; sizes confirmed with macOS `sips`
  it.each([
    ['photo.jpg', 'image/jpeg', 48, 48],
    ['photo.png', 'image/png', 29, 64],
    ['lossy.webp', 'image/webp', 29, 64],
    ['lossless.webp', 'image/webp', 29, 64],
    ['extended.webp', 'image/webp', 40, 40],
  ])('%s → %s %i×%i', (name, type, width, height) => {
    expect(probeImage(fixture(name))).toEqual({ type, width, height });
  });

  it('a renamed non-image is refused', () => {
    expect(
      probeImage(Buffer.from('%PDF-1.7 not a photo at all......')),
    ).toBeNull();
  });

  it('an empty or tiny file is refused', () => {
    expect(probeImage(Buffer.alloc(0))).toBeNull();
    expect(probeImage(Buffer.from([0xff, 0xd8]))).toBeNull();
  });

  it('a JPEG cut off before its frame header is refused', () => {
    const jpg = fixture('photo.jpg');
    // Long enough for the signature, too short for the SOF segment
    expect(probeImage(jpg.subarray(0, 20))).toBeNull();
  });

  it('a PNG with a zero size is refused', () => {
    const png = Buffer.from(fixture('photo.png'));
    png.writeUInt32BE(0, 16);
    expect(probeImage(png)).toBeNull();
  });

  it('a corrupt JPEG segment marker is refused', () => {
    const jpg = Buffer.from(fixture('photo.jpg'));
    jpg[2] = 0x00;
    expect(probeImage(jpg)).toBeNull();
  });
});

/** The real JPEG with `bytes` of APP15 metadata segments before its frame. */
function jpegWithMetadata(bytes: number): Buffer {
  const jpg = fixture('photo.jpg');
  const segments: Buffer[] = [];
  let left = bytes;
  while (left > 0) {
    // A segment holds at most 65533 bytes after its 2-byte length
    const payload = Math.min(left, 65533);
    const seg = Buffer.alloc(4 + payload, 0x20);
    seg[0] = 0xff;
    seg[1] = 0xef;
    seg.writeUInt16BE(payload + 2, 2);
    segments.push(seg);
    left -= payload;
  }
  return Buffer.concat([jpg.subarray(0, 2), ...segments, jpg.subarray(2)]);
}

describe('JPEG frame header after large metadata', () => {
  const jpg = jpegWithMetadata(300 * 1024);

  it('is found when the whole header area is read', () => {
    expect(jpg.length).toBeGreaterThan(256 * 1024);
    expect(probeImage(jpg)).toEqual({
      type: 'image/jpeg',
      width: 48,
      height: 48,
    });
  });

  it('is not found in only the first 256 KB (the old read size)', () => {
    expect(probeImage(jpg.subarray(0, 256 * 1024))).toBeNull();
  });

  it('is found within the 1 MB read', () => {
    expect(probeImage(jpg.subarray(0, 1024 * 1024))).not.toBeNull();
  });
});

describe('dimensionProblem', () => {
  it.each([
    [1, 1],
    [8192, 6103], // 49,995,776 px
    [6250, 8000], // exactly 50,000,000 px
    [8064, 6048], // 48 MP phone photo
    [4032, 3024],
  ])('%i × %i is accepted', (w, h) => {
    expect(dimensionProblem(w, h)).toBeNull();
  });

  it.each([
    [8193, 1, 'too_large'],
    [1, 8193, 'too_large'],
    [8192, 8192, 'too_large'], // 67 MP
    [6251, 8000, 'too_large'], // 50,008,000 px
    [8192, 6104, 'too_large'], // 50,003,968 px
    [0, 100, 'invalid_dimensions'],
    [100, -1, 'invalid_dimensions'],
    [10.5, 10, 'invalid_dimensions'],
    [Number.NaN, 10, 'invalid_dimensions'],
    [Number.POSITIVE_INFINITY, 10, 'invalid_dimensions'],
    [2 ** 53, 1, 'invalid_dimensions'],
  ])('%p × %p is refused (%s)', (w, h, reason) => {
    expect(dimensionProblem(w, h)).toBe(reason);
  });
});
