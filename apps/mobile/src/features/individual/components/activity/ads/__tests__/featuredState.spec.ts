import { activeFeatureLabel } from '../featuredState';

describe('activeFeatureLabel', () => {
  const now = new Date('2026-11-12T10:00:00Z');

  it('null for an ad that is not featured: «تمييز» shows', () => {
    expect(activeFeatureLabel({ isPremium: false }, now)).toBeNull();
    expect(activeFeatureLabel({}, now)).toBeNull();
  });

  it('«مميز حتى …» while featured, without the year', () => {
    const label = activeFeatureLabel(
      { isPremium: true, featuredUntil: '2026-11-20T10:00:00Z' },
      now,
    );
    expect(label).toMatch(/^مميز حتى /);
    expect(label).not.toMatch(/2026/);
  });

  it('«مميز» when featured with no end date', () => {
    expect(activeFeatureLabel({ isPremium: true, featuredUntil: null }, now)).toBe('مميز');
  });

  it('a featuring past its end can be featured again (before the server clears it)', () => {
    expect(
      activeFeatureLabel({ isPremium: true, featuredUntil: '2026-11-11T10:00:00Z' }, now),
    ).toBeNull();
  });
});
