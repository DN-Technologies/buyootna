import { adNumbersVisible } from './ad-contact.rules';

describe('adNumbersVisible', () => {
  it.each([
    [{ showPhone: false, showWhatsapp: false }, false],
    [{ showPhone: true, showWhatsapp: false }, true],
    [{ showPhone: false, showWhatsapp: true }, true],
    [{ showPhone: true, showWhatsapp: true }, true],
    [{}, true],
  ])('%j → numbers sent: %s', (ad, expected) => {
    expect(adNumbersVisible(ad)).toBe(expected);
  });
});
