import {
  BUSINESS_NAME_PATTERN,
  keepBusinessNameChars,
} from '@/shared/utils/businessName';

// QA: «اسم الشركة» took numbers, emojis and symbols
describe('business name', () => {
  it.each([
    'البنيان للمقاولات',
    'Buyootna Company',
    'شركة Al Bunyan',
    'مؤسسة گلستان',
    'شَرِكَة',
  ])('accepts %s', (name) => {
    expect(BUSINESS_NAME_PATTERN.test(name)).toBe(true);
  });

  it.each([
    'Company 123!@#',
    'شركة بيوتنا 💲',
    'شركة ٣',
    'شركة، بيوتنا',
    'Al-Bunyan',
    'شركة\nبيوتنا',
  ])('rejects %s', (name) => {
    expect(BUSINESS_NAME_PATTERN.test(name)).toBe(false);
  });

  it('drops what may not be typed, keeping letters and spaces', () => {
    expect(keepBusinessNameChars('Company 123!@#')).toBe('Company ');
    expect(keepBusinessNameChars('شركة بيوتنا 💲')).toBe('شركة بيوتنا ');
    expect(keepBusinessNameChars('شركة ٣٤')).toBe('شركة ');
  });
});
