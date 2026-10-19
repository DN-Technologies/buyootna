import { BadRequestException } from '@nestjs/common';

import {
  decodeViewersCursor,
  encodeViewersCursor,
} from '../utils/viewers-cursor';

const raw = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

describe('viewers cursor', () => {
  const cursor = {
    viewedAt: new Date('2026-10-20T11:00:00.123Z'),
    viewerIdentityId: '0b6f3a2e-6f5d-4a4b-9e7c-1d2e3f4a5b6c',
  };

  it('round-trips', () => {
    expect(decodeViewersCursor(encodeViewersCursor(cursor))).toEqual(cursor);
  });

  it.each([
    ['not base64 json', 'nope'],
    [
      'wrong version',
      raw({ v: 2, t: cursor.viewedAt, i: cursor.viewerIdentityId }),
    ],
    ['bad date', raw({ v: 1, t: 'soon', i: cursor.viewerIdentityId })],
    ['id is not an id', raw({ v: 1, t: cursor.viewedAt, i: "x' OR 1=1" })],
    ['not an object', raw('text')],
  ])('%s is a 400', (_label, value) => {
    expect(() => decodeViewersCursor(value)).toThrow(BadRequestException);
  });
});
