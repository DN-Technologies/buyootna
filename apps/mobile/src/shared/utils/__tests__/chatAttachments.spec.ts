import {
  attachmentsProblem,
  documentStyle,
  formatDuration,
  formatFileSize,
  lastMessagePreview,
  messageTypeFor,
  readableFileName,
  refusedOutright,
  uploadRefusal,
} from '../chatAttachments';

jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));

const file = (over = {}) => ({
  uri: 'file:///x',
  name: 'x.pdf',
  mimeType: 'application/pdf',
  size: 1000,
  kind: 'FILE' as const,
  ...over,
});

describe('chat attachment helpers', () => {
  it('refuses more than 10, oversize files and unsupported documents', () => {
    expect(attachmentsProblem([file()])).toBeNull();
    expect(attachmentsProblem(Array.from({ length: 11 }, () => file()))).toContain('10');
    expect(
      attachmentsProblem([file({ kind: 'IMAGE', mimeType: 'image/jpeg', size: 11 * 1024 * 1024 })]),
    ).toContain('10 ميجابايت');
    expect(attachmentsProblem([file({ size: 19 * 1024 * 1024 })])).toBeNull();
    expect(attachmentsProblem([file({ mimeType: 'application/zip' })])).toContain('غير مدعوم');
  });

  it('previews the last message in the chats list', () => {
    expect(lastMessagePreview(null)).toBe('بدء المحادثة');
    expect(lastMessagePreview({ type: 'IMAGE', content: null, attachmentsCount: 3 })).toBe(
      '📷 3 صور',
    );
    expect(lastMessagePreview({ type: 'IMAGE', content: null })).toBe('📷 صورة');
    expect(
      lastMessagePreview({ type: 'FILE', content: null, attachmentName: 'عقد.pdf' }),
    ).toBe('📎 عقد.pdf');
    expect(lastMessagePreview({ type: 'TEXT', content: 'مرحبا' })).toBe('مرحبا');
  });

  it('labels documents and sizes', () => {
    expect(documentStyle('application/pdf').label).toBe('PDF');
    expect(documentStyle('application/octet-stream', 'a.xlsx').label).toBe('XLS');
    expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
    expect(formatFileSize(300 * 1024)).toBe('300 KB');
  });

  it('video and voice: limits, types, lengths and previews', () => {
    const video = file({ kind: 'VIDEO', mimeType: 'video/mp4', size: 60 * 1024 * 1024, durationMs: 90000 });
    expect(attachmentsProblem([video])).toBeNull();
    expect(attachmentsProblem([{ ...video, size: 101 * 1024 * 1024 }])).toContain('100 ميجابايت');
    expect(attachmentsProblem([{ ...video, durationMs: 200000 }])).toContain('دقيقة');
    expect(messageTypeFor([{ kind: 'AUDIO' }])).toBe('VOICE');
    expect(messageTypeFor([{ kind: 'IMAGE' }, { kind: 'VIDEO' }])).toBe('VIDEO');
    expect(messageTypeFor([{ kind: 'IMAGE' }])).toBe('IMAGE');
    expect(formatDuration(125000)).toBe('2:05');
    expect(lastMessagePreview({ type: 'VIDEO', content: null })).toBe('🎥 فيديو');
    expect(
      lastMessagePreview({ type: 'VOICE', content: null, attachmentDurationMs: 42000 }),
    ).toBe('🎤 رسالة صوتية (0:42)');
  });

  // QA (iOS): a video over the limit was refused with no message
  it('names the limit for a video that is too large or too long', () => {
    const video = (over = {}) =>
      file({ kind: 'VIDEO', mimeType: 'video/mp4', name: 'tour.mov', ...over });

    expect(attachmentsProblem([video({ size: 120 * 1024 * 1024 })])).toBe(
      'حجم الفيديو يتجاوز الحد المسموح به (الحد الأقصى 100 ميجابايت)',
    );
    expect(attachmentsProblem([video({ durationMs: 200_000 })])).toBe(
      'مدة الفيديو أطول من الحد المسموح به (2 دقيقة)',
    );
    expect(attachmentsProblem([video({ size: 60 * 1024 * 1024, durationMs: 90_000 })])).toBeNull();
  });

  it('refuses a single file at once, but lets several through to the preview', () => {
    const big = file({ kind: 'VIDEO', mimeType: 'video/mp4', size: 120 * 1024 * 1024 });

    expect(refusedOutright([big])).toContain('100 ميجابايت');
    expect(refusedOutright([file()])).toBeNull();
    // One of several: the preview shows the reason and lets it be removed
    expect(refusedOutright([file(), file({ size: 30 * 1024 * 1024 })])).toBeNull();
  });

  it('explains an upload the server refused, and nothing for a lost connection', () => {
    expect(uploadRefusal({ response: { status: 413 } })).toContain('100 ميجابايت');
    expect(
      uploadRefusal({ response: { status: 400, data: { message: 'حجم الملف x أكبر من 20 ميجابايت' } } }),
    ).toBe('حجم الملف x أكبر من 20 ميجابايت');
    expect(uploadRefusal({ response: { status: 500 } })).toBeNull();
    expect(uploadRefusal(new Error('Network Error'))).toBeNull();
  });

  // QA screenshot (iOS): a sent PDF was named "Buyootna%20QA%20_%2..."
  it('shows a picked file under its readable name', () => {
    expect(readableFileName('Buyootna%20QA%20_%28v2%29.pdf')).toBe('Buyootna QA _(v2).pdf');
    expect(readableFileName('%D8%B9%D9%82%D8%AF.pdf')).toBe('عقد.pdf');
    expect(readableFileName('عقد 100%.pdf')).toBe('عقد 100%.pdf');
    // Not valid encoding: left as it is
    expect(readableFileName('report%ZZ%20.pdf')).toBe('report%ZZ%20.pdf');
    expect(readableFileName('50%25 off.pdf')).toBe('50% off.pdf');
  });
});
