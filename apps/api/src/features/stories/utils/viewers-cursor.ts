import { BadRequestException } from '@nestjs/common';

/** Where a viewer-list page ended: newest first, then by profile id. */
export interface ViewersCursor {
  viewedAt: Date;
  viewerIdentityId: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeViewersCursor(cursor: ViewersCursor): string {
  return Buffer.from(
    JSON.stringify({
      v: 1,
      t: cursor.viewedAt.toISOString(),
      i: cursor.viewerIdentityId,
    }),
  ).toString('base64url');
}

/** Reads a cursor the server issued; anything else is a 400. */
export function decodeViewersCursor(raw: string): ViewersCursor {
  const invalid = () =>
    new BadRequestException({
      statusCode: 400,
      message: 'صفحة غير صالحة، يرجى التحديث',
      code: 'STORY_CURSOR_INVALID',
    });
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw invalid();
  }
  if (typeof parsed !== 'object' || parsed === null) throw invalid();
  const v = parsed as Record<string, unknown>;
  if (v.v !== 1 || typeof v.t !== 'string' || typeof v.i !== 'string') {
    throw invalid();
  }
  const viewedAt = new Date(v.t);
  if (Number.isNaN(viewedAt.getTime()) || !UUID.test(v.i)) throw invalid();
  return { viewedAt, viewerIdentityId: v.i };
}
