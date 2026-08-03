import { Test, TestingModule } from '@nestjs/testing';
import { UsersDirectoryService } from './users-directory.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('UsersDirectoryService', () => {
  let service: UsersDirectoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersDirectoryService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersDirectoryService>(UsersDirectoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
