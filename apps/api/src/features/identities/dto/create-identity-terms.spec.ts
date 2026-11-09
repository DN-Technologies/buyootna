import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { CreateCompanyIdentityDto } from './create-company-identity.dto';
import { CreateOfficeIdentityDto } from './create-office-identity.dto';

// The app's global pipe (main.ts)
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const validate = (
  metatype: object,
  body: Record<string, unknown>,
): Promise<{ acceptTerms?: unknown }> =>
  pipe.transform(body, {
    type: 'body',
    metatype: metatype as never,
  }) as Promise<{
    acceptTerms?: unknown;
  }>;

// QA: «إضافة حساب» › شركة / مكتب created the profile with the terms
// unticked. A multipart body sends them as the string "true"
describe.each([
  ['company', CreateCompanyIdentityDto, { name: 'شركة', specialty: 'مقاولات' }],
  ['office', CreateOfficeIdentityDto, { name: 'مكتب', licenseNumber: '123' }],
])('POST /identities/%s terms', (_, dto, fields) => {
  it.each([
    ['missing', {}],
    ['"false"', { acceptTerms: 'false' }],
    ['false', { acceptTerms: false }],
    ['anything else', { acceptTerms: 'yes' }],
  ])('refuses the terms %s', async (__, terms) => {
    await expect(validate(dto, { ...fields, ...terms })).rejects.toThrow(
      BadRequestException,
    );
    await validate(dto, { ...fields, ...terms }).catch(
      (e: BadRequestException) =>
        expect(JSON.stringify(e.getResponse())).toContain(
          'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
        ),
    );
  });

  it.each([
    ['"true" (multipart)', 'true'],
    ['true (JSON)', true],
  ])('takes the terms ticked: %s', async (__, value) => {
    const out = await validate(dto, { ...fields, acceptTerms: value });
    expect(out.acceptTerms).toBe(true);
  });
});
