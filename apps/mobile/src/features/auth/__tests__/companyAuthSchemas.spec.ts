import { createCompanySignupSchema } from '../companyAuthSchemas';

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
