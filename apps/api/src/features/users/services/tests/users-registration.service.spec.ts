import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRegistrationPendingService } from '../provider-registration-pending.service';
import { UsersRegistrationService } from '../users-registration.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IdentitiesService } from '../../../identities/identities.service';
import { TwilioService } from '../../../../core/twilio/twilio.service';
import { EmailOtpService } from '../../../../core/email-otp/email-otp.service';
import { PhoneRegistrationPendingService } from '../../../../core/phone-registration/phone-registration-pending.service';
import { OtpRateLimiterService } from '../../../../core/otp-rate-limiter/otp-rate-limiter.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface MockUserCreateArgs {
  data: {
    email?: string;
    phone?: string;
    password: string;
    role: string;
    name: string;
  };
}

const buildTx = () => ({
  user: {
    create: jest.fn((args: MockUserCreateArgs) =>
      Promise.resolve({
        id: 'user-1',
        email: args.data.email ?? null,
        phone: args.data.phone ?? null,
        password: args.data.password,
        role: args.data.role,
        name: args.data.name,
      }),
    ),
  },
  individualProfile: {
    create: jest.fn().mockResolvedValue({ id: 'profile-1', userId: 'user-1' }),
  },
  identity: {
    create: jest.fn().mockResolvedValue({ id: 'identity-1' }),
  },
});

type Tx = ReturnType<typeof buildTx>;

const buildPrismaMock = () => ({
  user: { findFirst: jest.fn().mockResolvedValue(null) },
  $transaction: jest.fn((cb: (tx: Tx) => unknown) => cb(buildTx())),
});

describe('UsersRegistrationService', () => {
  let service: UsersRegistrationService;
  let prisma: ReturnType<typeof buildPrismaMock>;
  let twilioService: { sendVerification: jest.Mock };
  let emailOtpService: {
    sendRegistrationOtp: jest.Mock;
    verifyAndConsume: jest.Mock;
  };
  let phonePendingService: {
    save: jest.Mock;
    hasPending: jest.Mock;
    consume: jest.Mock;
  };
  let rateLimiter: {
    recordRequest: jest.Mock;
    checkRequestLimit: jest.Mock;
    recordVerifyAttempt: jest.Mock;
  };
  let providerPending: ProviderRegistrationPendingService;
  let identitiesService: {
    uploadProviderFiles: jest.Mock;
    createProviderPersonaInTx: jest.Mock;
    deleteUploads: jest.Mock;
  };

  beforeEach(async () => {
    prisma = buildPrismaMock();
    twilioService = {
      sendVerification: jest.fn().mockResolvedValue({ success: true }),
    };
    emailOtpService = {
      sendRegistrationOtp: jest.fn().mockResolvedValue(undefined),
      verifyAndConsume: jest.fn(),
    };
    phonePendingService = {
      save: jest.fn(),
      hasPending: jest.fn().mockReturnValue(true),
      consume: jest.fn(),
    };
    rateLimiter = {
      recordRequest: jest.fn(),
      checkRequestLimit: jest.fn(),
      recordVerifyAttempt: jest.fn(),
    };
    identitiesService = {
      uploadProviderFiles: jest
        .fn()
        .mockResolvedValue({ logoUrl: 'https://bucket/logo.png' }),
      createProviderPersonaInTx: jest.fn().mockResolvedValue({
        id: 'identity-c',
        companyData: { id: 'cd-1' },
        officeData: null,
      }),
      deleteUploads: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRegistrationService,
        { provide: PrismaService, useValue: prisma },
        { provide: IdentitiesService, useValue: identitiesService },
        { provide: TwilioService, useValue: twilioService },
        { provide: EmailOtpService, useValue: emailOtpService },
        {
          provide: PhoneRegistrationPendingService,
          useValue: phonePendingService,
        },
        { provide: OtpRateLimiterService, useValue: rateLimiter },
        ProviderRegistrationPendingService,
      ],
    }).compile();

    service = module.get<UsersRegistrationService>(UsersRegistrationService);
    providerPending = module.get(ProviderRegistrationPendingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerIndividual', () => {
    it('sends an email OTP and creates no account yet when the identifier is email-shaped', async () => {
      const result = await service.registerIndividual({
        name: 'Ali',
        identifier: 'ali@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        otpRequired: true,
        identifier: 'ali@example.com',
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      });
      expect(emailOtpService.sendRegistrationOtp).toHaveBeenCalledWith(
        'ali@example.com',
        'Ali',
        expect.any(String),
      );
      expect(twilioService.sendVerification).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('hashes the password before handing it to EmailOtpService', async () => {
      await service.registerIndividual({
        name: 'Ali',
        identifier: 'ali@example.com',
        password: 'password123',
      });

      const [, , hashedPassword] = emailOtpService.sendRegistrationOtp.mock
        .calls[0] as [string, string, string];
      expect(hashedPassword).not.toBe('password123');
      expect(bcrypt.compareSync('password123', hashedPassword)).toBe(true);
    });

    it('stashes the signup in the pending store and creates no account when the identifier is phone-shaped', async () => {
      const result = await service.registerIndividual({
        name: 'Ali',
        identifier: '55123456',
        password: 'password123',
      });

      expect(result).toEqual({
        otpRequired: true,
        identifier: '55123456',
        message: 'تم إرسال رمز التحقق إلى هاتفك',
      });
      expect(twilioService.sendVerification).toHaveBeenCalledWith(
        '55123456',
        'SIGNUP',
      );
      expect(emailOtpService.sendRegistrationOtp).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(phonePendingService.save).toHaveBeenCalledWith(
        '55123456',
        'Ali',
        expect.any(String),
      );
      const [, , hashedPassword] = phonePendingService.save.mock.calls[0] as [
        string,
        string,
        string,
      ];
      expect(hashedPassword).not.toBe('password123');
      expect(bcrypt.compareSync('password123', hashedPassword)).toBe(true);
    });

    it('records exactly one OTP request against the rate limiter per phone send, keyed by the raw identifier', async () => {
      await service.registerIndividual({
        name: 'Ali',
        identifier: '55123456',
        password: 'password123',
      });

      // Regression guard: TwilioService.sendVerification used to also
      // record its own (differently-keyed) request internally, so a single
      // send silently counted 2-3x against the progressive cooldown/daily
      // cap -- this service must be the only thing recording it, and only
      // once, using the same raw identifier the @OtpRequestRateLimit guard
      // checks.
      expect(rateLimiter.recordRequest).toHaveBeenCalledTimes(1);
      expect(rateLimiter.recordRequest).toHaveBeenCalledWith('55123456');
    });

    it('throws ConflictException when the identifier is already registered, without sending an OTP or touching the transaction', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'ali@example.com',
        phone: null,
      });

      await expect(
        service.registerIndividual({
          name: 'Ali',
          identifier: 'ali@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(emailOtpService.sendRegistrationOtp).not.toHaveBeenCalled();
      expect(twilioService.sendVerification).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException and stashes nothing when Twilio sendVerification fails for a phone identifier', async () => {
      twilioService.sendVerification.mockRejectedValue(
        new Error('twilio down'),
      );

      await expect(
        service.registerIndividual({
          name: 'Ali',
          identifier: '55123456',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(phonePendingService.save).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when EmailOtpService fails to send for an email identifier', async () => {
      emailOtpService.sendRegistrationOtp.mockRejectedValue(
        new Error('resend down'),
      );

      await expect(
        service.registerIndividual({
          name: 'Ali',
          identifier: 'ali@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('completeEmailRegistration', () => {
    it('throws BadRequestException and creates no user when the OTP is invalid or expired', async () => {
      emailOtpService.verifyAndConsume.mockReturnValue(null);

      await expect(
        service.completeEmailRegistration('ali@example.com', '000000'),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates the account only after a correct OTP, using the name and hashed password stashed at request-otp time', async () => {
      emailOtpService.verifyAndConsume.mockReturnValue({
        name: 'Ali',
        hashedPassword: 'hashed-value',
      });
      let tx: Tx | undefined;
      prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      const result = await service.completeEmailRegistration(
        'ali@example.com',
        '123456',
      );

      expect(result.user.email).toBe('ali@example.com');
      expect(result.user).not.toHaveProperty('password');
      const createCalls = tx!.user.create.mock.calls as Array<
        [{ data: { password: string; name: string } }]
      >;
      expect(createCalls[0][0].data.password).toBe('hashed-value');
      expect(createCalls[0][0].data.name).toBe('Ali');
      // Signed up with an email: signs in with the email by default
      expect(
        (createCalls[0][0].data as { loginMethod?: string }).loginMethod,
      ).toBe('EMAIL');
      expect(tx!.identity.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'INDIVIDUAL',
          isActive: true,
          individualData: { create: { name: 'Ali' } },
        },
      });
    });

    it('re-checks for a conflicting user before creating the account', async () => {
      emailOtpService.verifyAndConsume.mockReturnValue({
        name: 'Ali',
        hashedPassword: 'hashed-value',
      });
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'ali@example.com',
        phone: null,
      });

      await expect(
        service.completeEmailRegistration('ali@example.com', '123456'),
      ).rejects.toThrow(ConflictException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('completePhoneRegistration', () => {
    it('throws BadRequestException and creates no user when there is no pending registration', async () => {
      phonePendingService.consume.mockReturnValue(null);

      await expect(
        service.completePhoneRegistration('55123456'),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates the account only after verification, using the name and hashed password stashed at registration time', async () => {
      phonePendingService.consume.mockReturnValue({
        name: 'Ali',
        hashedPassword: 'hashed-value',
      });
      let tx: Tx | undefined;
      prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      const result = await service.completePhoneRegistration('55123456');

      expect(result.user.phone).toBe('55123456');
      expect(result.user.email).toBeNull();
      expect(result.user).not.toHaveProperty('password');
      const createCalls = tx!.user.create.mock.calls as Array<
        [{ data: { password: string; name: string } }]
      >;
      expect(createCalls[0][0].data.password).toBe('hashed-value');
      expect(createCalls[0][0].data.name).toBe('Ali');
      // Signed up with a phone: signs in with the phone by default
      expect(
        (createCalls[0][0].data as { loginMethod?: string }).loginMethod,
      ).toBe('PHONE');
      expect(tx!.individualProfile.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      });
      expect(tx!.identity.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'INDIVIDUAL',
          isActive: true,
          individualData: { create: { name: 'Ali' } },
        },
      });
    });

    it('re-checks for a conflicting user before creating the account', async () => {
      phonePendingService.consume.mockReturnValue({
        name: 'Ali',
        hashedPassword: 'hashed-value',
      });
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: null,
        phone: '55123456',
      });

      await expect(
        service.completePhoneRegistration('55123456'),
      ).rejects.toThrow(ConflictException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
  // QA [Critical]: a company was created with a fake email, no code at all.
  // Now the form waits and the account is made only with the emailed code
  describe('company signup with an emailed code', () => {
    const dto = {
      email: 'co@example.com',
      password: 'password123',
      name: 'شركة',
      specialty: 'مكتب هندسي',
      licenseNumber: '12 3',
      verification: 'email',
    } as never;
    const withLicenseLookups = () =>
      Object.assign(prisma, {
        companyIdentityData: { findFirst: jest.fn().mockResolvedValue(null) },
        officeIdentityData: { findFirst: jest.fn().mockResolvedValue(null) },
      });

    it('step 1 emails a code and creates nothing', async () => {
      withLicenseLookups();

      const result = await service.registerCompany(dto);

      expect(result).toEqual({
        otpRequired: true,
        identifier: 'co@example.com',
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      });
      expect(emailOtpService.sendRegistrationOtp).toHaveBeenCalledWith(
        'co@example.com',
        'شركة',
        expect.any(String),
      );
      expect(rateLimiter.checkRequestLimit).toHaveBeenCalledWith(
        'co@example.com',
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(
        identitiesService.createProviderPersonaInTx,
      ).not.toHaveBeenCalled();
    });

    it('step 2 with the right code creates the login, then the persona', async () => {
      withLicenseLookups();
      await service.registerCompany(dto);
      emailOtpService.verifyAndConsume.mockReturnValue({
        name: 'شركة',
        hashedPassword: 'h',
      });

      const result = await service.completeProviderRegistration(
        'COMPANY',
        'co@example.com',
        '123456',
      );

      expect(identitiesService.createProviderPersonaInTx).toHaveBeenCalledWith(
        expect.anything(),
        'COMPANY',
        'user-1',
        expect.objectContaining({
          name: 'شركة',
          specialty: 'مكتب هندسي',
          logoUrl: 'https://bucket/logo.png',
        }),
        { isActive: true },
      );
      // The form is kept without the password
      const persona = (
        identitiesService.createProviderPersonaInTx.mock.calls[0] as unknown[]
      )[3] as object;
      expect(persona).not.toHaveProperty('password');
      expect(result.profile).toEqual({ id: 'cd-1' });
      expect(result.user).not.toHaveProperty('password');
      expect(rateLimiter.recordVerifyAttempt).toHaveBeenCalledWith(
        'co@example.com',
        true,
      );
    });

    it('a wrong code creates nothing and counts the attempt', async () => {
      withLicenseLookups();
      await service.registerCompany(dto);
      emailOtpService.verifyAndConsume.mockReturnValue(null);

      await expect(
        service.completeProviderRegistration(
          'COMPANY',
          'co@example.com',
          '000000',
        ),
      ).rejects.toThrow('رمز التحقق غير صحيح أو منتهي الصلاحية');
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(rateLimiter.recordVerifyAttempt).toHaveBeenCalledWith(
        'co@example.com',
        false,
      );
    });

    it("an office's code can't complete a company signup (and none waiting is refused)", async () => {
      withLicenseLookups();
      await service.registerCompany(dto);
      emailOtpService.verifyAndConsume.mockReturnValue({
        name: 'شركة',
        hashedPassword: 'h',
      });

      await expect(
        service.completeProviderRegistration(
          'OFFICE',
          'co@example.com',
          '123456',
        ),
      ).rejects.toThrow('انتهت جلسة التسجيل، يرجى إعادة المحاولة');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('starting again replaces the waiting signup and removes its files', async () => {
      withLicenseLookups();
      await service.registerCompany(dto);
      await service.registerCompany(dto);

      expect(identitiesService.deleteUploads).toHaveBeenCalledWith({
        logoUrl: 'https://bucket/logo.png',
      });
      expect(providerPending).toBeDefined();
    });

    it('refuses a taken licence with 409 before uploading or sending anything', async () => {
      withLicenseLookups().officeIdentityData.findFirst.mockResolvedValue({
        id: 'od-1',
      });

      await expect(service.registerCompany(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(identitiesService.uploadProviderFiles).not.toHaveBeenCalled();
      expect(emailOtpService.sendRegistrationOtp).not.toHaveBeenCalled();
    });

    it('a code that fails to send removes the uploads', async () => {
      withLicenseLookups();
      emailOtpService.sendRegistrationOtp.mockRejectedValue(new Error('smtp'));

      await expect(service.registerCompany(dto)).rejects.toThrow(
        'تعذر إرسال رمز التحقق إلى بريدك الإلكتروني',
      );
      expect(identitiesService.deleteUploads).toHaveBeenCalledWith({
        logoUrl: 'https://bucket/logo.png',
      });
    });

    it('removes the uploads and keeps the 409 when the persona is refused at step 2', async () => {
      withLicenseLookups();
      await service.registerCompany(dto);
      emailOtpService.verifyAndConsume.mockReturnValue({
        name: 'شركة',
        hashedPassword: 'h',
      });
      identitiesService.createProviderPersonaInTx.mockRejectedValue(
        new ConflictException('رقم الترخيص مسجل مسبقاً'),
      );

      await expect(
        service.completeProviderRegistration(
          'COMPANY',
          'co@example.com',
          '123456',
        ),
      ).rejects.toThrow(ConflictException);
      expect(identitiesService.deleteUploads).toHaveBeenCalledWith({
        logoUrl: 'https://bucket/logo.png',
      });
    });
  });
});
