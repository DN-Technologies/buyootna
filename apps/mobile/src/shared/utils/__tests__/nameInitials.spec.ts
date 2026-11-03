import { nameInitials } from '../nameInitials';

describe('nameInitials', () => {
  it("the name's first letter", () => {
    expect(nameInitials('شركة النبض التجريبية')).toBe('ش');
    expect(nameInitials('محمد العتيبي')).toBe('م');
  });

  it('leaves out «ال», so names don\'t all show «ا»', () => {
    expect(nameInitials('الصباح')).toBe('ص');
    expect(nameInitials('النبض للعقارات')).toBe('ن');
  });

  it('keeps a short word whole rather than emptying it', () => {
    // «ال» is only dropped when two letters or more follow
    expect(nameInitials('ال')).toBe('ا');
  });

  it('a Latin name in capitals', () => {
    expect(nameInitials('  ebrahim ali ')).toBe('E');
  });

  it('nothing for no name', () => {
    expect(nameInitials('')).toBe('');
    expect(nameInitials(null)).toBe('');
    expect(nameInitials(undefined)).toBe('');
  });
});
