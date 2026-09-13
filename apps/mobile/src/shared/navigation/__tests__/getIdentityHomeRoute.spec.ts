import { getIdentityHomeRoute } from '../getIdentityHomeRoute';

describe('getIdentityHomeRoute', () => {
  it('routes COMPANY to the company home', () => {
    expect(getIdentityHomeRoute('COMPANY')).toBe('/(company)/home');
  });

  it('routes OFFICE to the office home', () => {
    expect(getIdentityHomeRoute('OFFICE')).toBe('/(office)/office-home');
  });

  it('routes INDIVIDUAL to the individual home', () => {
    expect(getIdentityHomeRoute('INDIVIDUAL')).toBe('/(individual)/home');
  });

  it('falls back to the individual home for null', () => {
    expect(getIdentityHomeRoute(null)).toBe('/(individual)/home');
  });

  it('falls back to the individual home for undefined', () => {
    expect(getIdentityHomeRoute(undefined)).toBe('/(individual)/home');
  });

  it('falls back to the individual home for an unrecognized type', () => {
    expect(getIdentityHomeRoute('SOMETHING_ELSE' as any)).toBe(
      '/(individual)/home',
    );
  });
});
