import { Test, TestingModule } from '@nestjs/testing';
import { UsersProfileService } from './users-profile.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';

describe('UsersProfileService', () => {
  let service: UsersProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersProfileService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersProfileService>(UsersProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
