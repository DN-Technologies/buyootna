import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { UsersDirectoryService } from './services/users-directory.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersRegistrationService,
          useValue: {},
        },
        {
          provide: UsersProfileService,
          useValue: {},
        },
        {
          provide: UsersDirectoryService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
