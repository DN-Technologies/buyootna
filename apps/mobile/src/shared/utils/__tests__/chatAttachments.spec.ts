import {
  attachmentsProblem,
  documentStyle,
  formatFileSize,
  lastMessagePreview,
} from '../chatAttachments';

jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));

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
});
