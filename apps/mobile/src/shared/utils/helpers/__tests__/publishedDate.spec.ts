import { publishedDate } from '../property';

describe('publishedDate', () => {
  it('uses the latest publish date when the API sends one', () => {
    expect(
      publishedDate({
        publishedAt: '2026-09-28T10:00:00.000Z',
        createdAt: '2026-08-01T10:00:00.000Z',
      }),
    ).toBe('2026-09-28T10:00:00.000Z');
  });

  it('falls back to the creation date for older APIs or unpublished ads', () => {
    expect(publishedDate({ createdAt: '2026-08-01T10:00:00.000Z' })).toBe(
      '2026-08-01T10:00:00.000Z',
    );
    expect(
      publishedDate({ publishedAt: null, createdAt: '2026-08-01T10:00:00.000Z' }),
    ).toBe('2026-08-01T10:00:00.000Z');
  });
});
