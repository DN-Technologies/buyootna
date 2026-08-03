import { Test, TestingModule } from '@nestjs/testing';
import { UsersRegistrationService } from './users-registration.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { TwilioService } from '../../../core/twilio/twilio.service';

describe('UsersRegistrationService', () => {
  let service: UsersRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRegistrationService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
        {
          provide: TwilioService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersRegistrationService>(UsersRegistrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
