import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterCompanyDto } from '../../features/company/dto/register-company.dto';
import { RegisterOfficeDto } from '../../features/office/dto/register-office.dto';
import { VerifyProviderOtpDto } from '../../features/users/dto/verify-provider-otp.dto';
import { KUWAIT_PHONE_MESSAGE } from './business-contact';

// QA: a company's sign-up asks one «البريد الإلكتروني أو رقم الهاتف»
const errorsOn = async (
  cls: new () => object,
  body: object,
  property: string,
) => {
  const errors = await validate(plainToInstance(cls, body));
  return Object.values(
    errors.find((e) => e.property === property)?.constraints ?? {},
  );
};

const base = { name: 'البنيان', password: 'password123' };

describe('business sign-up contact', () => {
  it.each([
    ['company', RegisterCompanyDto],
    ['office', RegisterOfficeDto],
  ])('%s: a phone alone is enough, and must be Kuwaiti', async (_n, cls) => {
    expect(
      await errorsOn(
        cls,
        { ...base, phone: '55123456', verification: 'phone' },
        'email',
      ),
    ).toEqual([]);
    expect(
      await errorsOn(
        cls,
        { ...base, phone: '12345', verification: 'phone' },
        'phone',
      ),
    ).toContain(KUWAIT_PHONE_MESSAGE);
  });

  it('an email alone is still fine, and older apps are unchanged', async () => {
    expect(
      await errorsOn(
        RegisterCompanyDto,
        { ...base, email: 'co@example.com', verification: 'email' },
        'email',
      ),
    ).toEqual([]);
    expect(
      await errorsOn(
        RegisterCompanyDto,
        { ...base, email: 'co@example.com', verification: 'sms' },
        'verification',
      ),
    ).not.toEqual([]);
  });

  it('the code is verified with the email or the phone', async () => {
    expect(
      await validate(
        plainToInstance(VerifyProviderOtpDto, {
          phone: '+96555123456',
          otp: '1',
        }),
      ),
    ).toEqual([]);
    expect(
      await validate(
        plainToInstance(VerifyProviderOtpDto, {
          email: 'co@example.com',
          otp: '1',
        }),
      ),
    ).toEqual([]);
  });
});
