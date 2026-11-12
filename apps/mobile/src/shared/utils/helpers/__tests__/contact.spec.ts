import {
  adContactPhone,
  adShowsCall,
  adShowsWhatsapp,
  canUseWhatsapp,
  hostHasWhatsapp,
} from '@/shared/utils/helpers/contact';

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

describe('canUseWhatsapp', () => {
  it('works only between individuals (signed out counts as one)', () => {
    expect(canUseWhatsapp('INDIVIDUAL', 'INDIVIDUAL')).toBe(true);
    expect(canUseWhatsapp(undefined, 'INDIVIDUAL')).toBe(true);
  });

  it('never reaches a company or office', () => {
    expect(canUseWhatsapp('INDIVIDUAL', 'COMPANY')).toBe(false);
    expect(canUseWhatsapp('INDIVIDUAL', 'OFFICE')).toBe(false);
  });

  it('is never offered to a company or office', () => {
    expect(canUseWhatsapp('COMPANY', 'INDIVIDUAL')).toBe(false);
    expect(canUseWhatsapp('OFFICE', 'INDIVIDUAL')).toBe(false);
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

// QA: «اتصال» / «واتساب» switched off in «طرق التواصل» still showed
describe('adShowsCall / adShowsWhatsapp', () => {
  it('hide a method the ad turned off', () => {
    expect(adShowsCall({ showPhone: false })).toBe(false);
    expect(adShowsWhatsapp({ showWhatsapp: false })).toBe(false);
  });

  it('show it when on, and for older ads without the flag', () => {
    expect(adShowsCall({ showPhone: true })).toBe(true);
    expect(adShowsWhatsapp({ showWhatsapp: true })).toBe(true);
    expect(adShowsCall({})).toBe(true);
    expect(adShowsWhatsapp(undefined)).toBe(true);
  });
});
