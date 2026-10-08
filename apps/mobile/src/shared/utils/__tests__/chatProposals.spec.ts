import { lastMessagePreview } from '@/shared/utils/chatAttachments';
import { formatAppointment, formatOffer, mapLinks } from '@/shared/utils/chatProposals';

jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));

describe('chat proposals / location helpers', () => {
  it('formats appointments in 12-hour device time and offers in KWD', () => {
    expect(formatAppointment(new Date(2026, 9, 8, 16, 30).toISOString())).toBe(
      'الخميس 8/10 · 4:30 م',
    );
    expect(formatOffer(450, 'MONTHLY')).toBe('450 د.ك / شهرياً');
    expect(formatOffer(250000, 'TOTAL')).toBe('250,000 د.ك');
  });

  it('previews pins, appointments and offers in the chats list', () => {
    expect(lastMessagePreview({ type: 'LOCATION', content: null, locationLabel: 'السالمية' })).toBe(
      '📍 السالمية',
    );
    expect(
      lastMessagePreview({ type: 'LOCATION', content: null, location: { label: 'حولي' } }),
    ).toBe('📍 حولي');
    expect(
      lastMessagePreview({
        type: 'OFFER',
        content: null,
        proposal: { id: 'o', kind: 'OFFER', status: 'PENDING', amount: 240000, period: 'TOTAL' },
      }),
    ).toBe('💰 عرض سعر: 240,000 د.ك');
    expect(lastMessagePreview({ type: 'APPOINTMENT', content: null })).toBe('📅 موعد معاينة');
  });

  it('builds Apple / Google Maps links', () => {
    expect(mapLinks(29.3, 48.07, 'السالمية').google).toBe(
      'https://www.google.com/maps/search/?api=1&query=29.3,48.07',
    );
    expect(mapLinks(29.3, 48.07).apple).toContain('ll=29.3,48.07');
  });
});
