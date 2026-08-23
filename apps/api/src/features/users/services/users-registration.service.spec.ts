import { Test, TestingModule } from '@nestjs/testing';
import { UsersRegistrationService } from './users-registration.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import {
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

  beforeEach(async () => {
    prisma = buildPrismaMock();
    twilioService = {
      sendVerification: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRegistrationService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: {} },
        { provide: TwilioService, useValue: twilioService },
      ],
    }).compile();

    service = module.get<UsersRegistrationService>(UsersRegistrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerIndividual', () => {
    it('creates a user with only email set and does not send an SMS OTP when the identifier is email-shaped', async () => {
      const result = await service.registerIndividual({
        identifier: 'ali@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('ali@example.com');
      expect(result.user.phone).toBeNull();
      expect(twilioService.sendVerification).not.toHaveBeenCalled();
    });

    it('creates a user with only phone set and sends an SMS OTP when the identifier is phone-shaped', async () => {
      const result = await service.registerIndividual({
        identifier: '55123456',
        password: 'password123',
      });

      expect(result.user.phone).toBe('55123456');
      expect(result.user.email).toBeNull();
      expect(twilioService.sendVerification).toHaveBeenCalledWith('55123456');
    });

    it('throws ConflictException when the identifier is already registered, without sending an OTP or touching the transaction', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'ali@example.com',
        phone: null,
      });

      await expect(
        service.registerIndividual({
          identifier: 'ali@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(twilioService.sendVerification).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException and creates no user when Twilio sendVerification fails for a phone identifier', async () => {
      twilioService.sendVerification.mockRejectedValue(
        new Error('twilio down'),
      );

      await expect(
        service.registerIndividual({
          identifier: '55123456',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when the database transaction fails', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('db down'),
      );

      await expect(
        service.registerIndividual({
          identifier: 'ali@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('hashes the password with bcrypt before storing it', async () => {
      let tx: Tx | undefined;
      prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      const result = await service.registerIndividual({
        identifier: 'ali@example.com',
        password: 'password123',
      });

      expect(result.user).not.toHaveProperty('password');
      // buildTx's user.create echoes back whatever password it was given,
      // so we can inspect the hash that was actually passed in.
      const createCalls = tx!.user.create.mock.calls as Array<
        [{ data: { password: string } }]
      >;
      const storedHash = createCalls[0][0].data.password;
      expect(storedHash).not.toBe('password123');
      expect(bcrypt.compareSync('password123', storedHash)).toBe(true);
    });

    it('creates an associated IndividualProfile and an active INDIVIDUAL Identity record', async () => {
      let tx: Tx | undefined;
      prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      await service.registerIndividual({
        identifier: 'ali@example.com',
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
          individualData: { create: {} },
        },
      });
    });
  });
});
