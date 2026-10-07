import { adContactPhone, hostHasWhatsapp } from '@/shared/utils/helpers/contact';

describe('hostHasWhatsapp', () => {
  it('companies and offices have no WhatsApp', () => {
    expect(hostHasWhatsapp('COMPANY')).toBe(false);
    expect(hostHasWhatsapp('OFFICE')).toBe(false);
  });

  it('people do (and older data without a role)', () => {
    expect(hostHasWhatsapp('INDIVIDUAL')).toBe(true);
    expect(hostHasWhatsapp(undefined)).toBe(true);
  });
});

describe('adContactPhone', () => {
  it("prefers the ad's own number, then the advertiser's contact number", () => {
    expect(
      adContactPhone({ phoneNumber: '55556666', host: { phone: '99990000' } }),
    ).toBe('55556666');
    expect(adContactPhone({ host: { phone: '99990000' } })).toBe('99990000');
  });

  it('never invents a number', () => {
    expect(adContactPhone({})).toBeNull();
    expect(adContactPhone(null)).toBeNull();
  });
});
