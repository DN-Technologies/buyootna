import { defaultLoginMethod } from './user.utils';

describe('defaultLoginMethod', () => {
  it('a phone-only account signs in with its phone', () => {
    expect(defaultLoginMethod(null, '55123456')).toBe('PHONE');
    expect(defaultLoginMethod('', '55123456')).toBe('PHONE');
  });

  it('an email-only account signs in with its email', () => {
    expect(defaultLoginMethod('ali@example.com', undefined)).toBe('EMAIL');
    expect(defaultLoginMethod('ali@example.com', '  ')).toBe('EMAIL');
  });

  it('an account with both accepts either (BOTH)', () => {
    expect(defaultLoginMethod('ali@example.com', '55123456')).toBeNull();
  });

  it('an account with neither has no default', () => {
    expect(defaultLoginMethod(undefined, null)).toBeNull();
  });
});
