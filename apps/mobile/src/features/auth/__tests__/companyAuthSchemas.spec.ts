import { createCompanySignupSchema, getStep1Fields } from '../companyAuthSchemas';

// Adding a company or office to a signed-in account (no account fields)
const schema = createCompanySignupSchema(false);

const messages = (data: object) => {
  const result = schema.safeParse(data);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('company sign-up step 3', () => {
  // The licence moved to «طلب التوثيق»; sign-up asks «التخصص»
  it('a company needs its specialty, not a licence', () => {
    expect(messages({ type: 'company', name: 'شركة البناء' })).toEqual([
      'التخصص مطلوب',
    ]);
    expect(
      messages({ type: 'company', name: 'شركة البناء', specialty: 'مقاول عام' }),
    ).toEqual([]);
  });

  it('an office still needs its licence number', () => {
    expect(messages({ type: 'office', name: 'مكتب الكويت' })).toEqual([
      'رقم الرخصة مطلوب',
    ]);
    expect(
      messages({ type: 'office', name: 'مكتب الكويت', licenseNumber: '123456' }),
    ).toEqual([]);
  });
});

// QA: «اسم الشركة» took numbers, emojis and symbols
describe('company or office name', () => {
  const company = (name: string) =>
    messages({ type: 'company', name, specialty: 'مقاول عام' });

  it('takes Arabic or English letters and spaces', () => {
    expect(company('البنيان للمقاولات')).toEqual([]);
    expect(company('Al Bunyan')).toEqual([]);
  });

  it('refuses numbers, emojis and symbols with a message', () => {
    for (const name of ['Company 123!@#', 'شركة بيوتنا 💲']) {
      expect(company(name)).toEqual([
        'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية ومسافات فقط',
      ]);
    }
  });

  it('applies to an office too', () => {
    expect(
      messages({ type: 'office', name: 'مكتب 24', licenseNumber: '123456' }),
    ).toEqual(['الاسم يجب أن يحتوي على حروف عربية أو إنجليزية ومسافات فقط']);
  });
});

// QA: one «البريد الإلكتروني أو رقم الهاتف» instead of two fields
describe('a new company or office account: email or phone', () => {
  const signup = createCompanySignupSchema(true);
  const errorsFor = (identifier: string | undefined) => {
    const result = signup.safeParse({
      type: 'company',
      name: 'شركة البناء',
      specialty: 'مقاول عام',
      identifier,
      password: 'password123',
      confirmPassword: 'password123',
    });
    return result.success
      ? []
      : result.error.issues
          .filter((issue) => issue.path[0] === 'identifier')
          .map((issue) => issue.message);
  };

  it('takes an email or a Kuwaiti mobile', () => {
    expect(errorsFor('co@example.com')).toEqual([]);
    expect(errorsFor('55123456')).toEqual([]);
    expect(errorsFor('+96565123456')).toEqual([]);
  });

  it('needs one of them, well formed', () => {
    expect(errorsFor(undefined)).toEqual(['هذا الحقل مطلوب']);
    expect(errorsFor('12345')).toEqual([
      'أدخل بريد إلكتروني أو رقم هاتف كويتي صحيح',
    ]);
  });

  it('step 1 checks the one field, not an email and a phone', () => {
    expect(getStep1Fields(true)).toEqual([
      'name',
      'identifier',
      'password',
      'confirmPassword',
    ]);
  });
});
