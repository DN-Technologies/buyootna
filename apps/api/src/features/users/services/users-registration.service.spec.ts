import { Test, TestingModule } from '@nestjs/testing';
import { UsersRegistrationService } from './users-registration.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import { EmailOtpService } from '../../../core/email-otp/email-otp.service';
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

  beforeEach(async () => {
    prisma = buildPrismaMock();
    twilioService = {
      sendVerification: jest.fn().mockResolvedValue({ success: true }),
    };
    emailOtpService = {
      sendRegistrationOtp: jest.fn().mockResolvedValue(undefined),
      verifyAndConsume: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRegistrationService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: {} },
        { provide: TwilioService, useValue: twilioService },
        { provide: EmailOtpService, useValue: emailOtpService },
      ],
    }).compile();

    service = module.get<UsersRegistrationService>(UsersRegistrationService);
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

    it('creates a user with only phone set and sends an SMS OTP when the identifier is phone-shaped', async () => {
      const result = await service.registerIndividual({
        name: 'Ali',
        identifier: '55123456',
        password: 'password123',
      });

      expect(result.user?.phone).toBe('55123456');
      expect(result.user?.email).toBeNull();
      expect(twilioService.sendVerification).toHaveBeenCalledWith(
        '55123456',
      );
      expect(emailOtpService.sendRegistrationOtp).not.toHaveBeenCalled();
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

    it('throws InternalServerErrorException and creates no user when Twilio sendVerification fails for a phone identifier', async () => {
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

    it('throws InternalServerErrorException when the database transaction fails for a phone identifier', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('db down'),
      );

      await expect(
        service.registerIndividual({
          name: 'Ali',
          identifier: '55123456',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('creates an associated IndividualProfile and an active INDIVIDUAL Identity record carrying the given name for a phone identifier', async () => {
      let tx: Tx | undefined;
      prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      await service.registerIndividual({
        name: 'Ali',
        identifier: '55123456',
        password: 'password123',
      });

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
});
