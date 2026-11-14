import { BadRequestException } from '@nestjs/common';

import { CompanyController } from './company.controller';
import { OfficeController } from '../office/office.controller';

// QA [Critical]: a company account was created with no proof of its email.
// Signup is now the form, then the emailed code; the old one-step request
// (apps from before) is told to update instead of creating anything.
describe('company/office signup endpoints', () => {
  const registration = {
    registerCompany: jest.fn().mockResolvedValue({ otpRequired: true }),
    registerOffice: jest.fn().mockResolvedValue({ otpRequired: true }),
    completeProviderRegistration: jest.fn().mockResolvedValue({ user: {} }),
  };
  const company = new CompanyController(
    registration as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const OfficeCtor = OfficeController as unknown as new (
    ...a: unknown[]
  ) => OfficeController;
  const office = new OfficeCtor(registration, {}, {}, {}, {}, {}, {});
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [
      'company',
      () => company.registerCompany({ email: 'a@b.co' } as never, {}),
    ],
    ['office', () => office.registerOffice({ email: 'a@b.co' } as never, {})],
  ])(
    '%s: an app without the code step is told to update; nothing is made',
    async (_, call) => {
      await expect(call()).rejects.toThrow(BadRequestException);
      await expect(call()).rejects.toThrow('يرجى تحديث التطبيق لإكمال التسجيل');
      expect(registration.registerCompany).not.toHaveBeenCalled();
      expect(registration.registerOffice).not.toHaveBeenCalled();
    },
  );

  it('step 1 goes ahead with the code step', async () => {
    await company.registerCompany(
      { email: 'a@b.co', verification: 'email' } as never,
      {},
    );
    expect(registration.registerCompany).toHaveBeenCalled();
  });

  it.each([
    [
      'company',
      'COMPANY',
      () =>
        company.verifyCompanyRegistration({
          email: 'a@b.co',
          otp: '1',
        }),
    ],
    [
      'office',
      'OFFICE',
      () => office.verifyOfficeRegistration({ email: 'a@b.co', otp: '1' }),
    ],
  ])('%s: step 2 completes with the code', async (_, type, call) => {
    await call();
    expect(registration.completeProviderRegistration).toHaveBeenCalledWith(
      type,
      { email: 'a@b.co', phone: undefined },
      '1',
    );
  });

  // One «البريد الإلكتروني أو رقم الهاتف»: the code may go by SMS
  it('step 1 by phone goes ahead too', async () => {
    await office.registerOffice(
      { phone: '55123456', verification: 'phone' } as never,
      {},
    );
    expect(registration.registerOffice).toHaveBeenCalled();
  });

  it('step 2 by phone passes the phone on', async () => {
    await company.verifyCompanyRegistration({ phone: '55123456', otp: '1' });
    expect(registration.completeProviderRegistration).toHaveBeenCalledWith(
      'COMPANY',
      { email: undefined, phone: '55123456' },
      '1',
    );
  });
});
