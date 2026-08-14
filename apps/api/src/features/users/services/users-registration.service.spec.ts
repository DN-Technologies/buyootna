import { Test, TestingModule } from '@nestjs/testing';
import { UsersRegistrationService } from './users-registration.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { TwilioService } from '../../../core/twilio/twilio.service';

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
  });
});
