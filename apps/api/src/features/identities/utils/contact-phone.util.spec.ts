import { contactPhoneOf, contactWhatsappOf } from './contact-phone.util';

describe('contactPhoneOf', () => {
  const user = { phone: '99990000', whatsapp: '98887777' };

  it.each(['INDIVIDUAL', 'COMPANY', 'OFFICE'])(
    "%s uses the account's phone by default",
    (type) => {
      expect(contactPhoneOf({ type, useAccountPhone: true }, user)).toBe(
        '99990000',
      );
      // Older rows without the column behave the same
      expect(contactPhoneOf({ type }, user)).toBe('99990000');
    },
  );

  it.each(['INDIVIDUAL', 'COMPANY', 'OFFICE'])(
    '%s uses its own number when it opted out',
    (type) => {
      expect(
        contactPhoneOf(
          { type, useAccountPhone: false, contactPhone: '22223333' },
          user,
        ),
      ).toBe('22223333');
    },
  );

  it('has no number when neither is set', () => {
    expect(contactPhoneOf({ type: 'COMPANY' }, { phone: null })).toBeNull();
  });
});

describe('contactWhatsappOf', () => {
  const user = { phone: '99990000', whatsapp: '98887777' };

  it.each(['COMPANY', 'OFFICE'])('%s has no WhatsApp', (type) => {
    expect(contactWhatsappOf({ type }, user)).toBeNull();
  });

  it("an individual uses their WhatsApp, else the account's, else their phone", () => {
    expect(
      contactWhatsappOf(
        { type: 'INDIVIDUAL', individualData: { whatsapp: '91112222' } },
        user,
      ),
    ).toBe('91112222');
    expect(contactWhatsappOf({ type: 'INDIVIDUAL' }, user)).toBe('98887777');
    expect(
      contactWhatsappOf({ type: 'INDIVIDUAL' }, { phone: '99990000' }),
    ).toBe('99990000');
  });
});
