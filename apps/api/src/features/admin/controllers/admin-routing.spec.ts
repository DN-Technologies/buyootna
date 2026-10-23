import type { INestApplication } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';

import { AdminService } from '../admin.service';
import { AdminGuard } from '../guards/admin.guard';
import { ADMIN_CONTROLLERS } from './index';

/**
 * The admin routes live in several controllers; Nest matches them in the
 * order the controllers are registered, so a literal path in one must not
 * be swallowed by a :param route in an earlier one.
 */
describe('admin routing across controllers', () => {
  let app: INestApplication;
  let baseUrl: string;
  const adminService = {
    exportUsersCsv: jest.fn().mockResolvedValue('csv'),
    getUserById: jest.fn().mockResolvedValue({ id: 'u-1' }),
  };
  const allow = { canActivate: () => true };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: ADMIN_CONTROLLERS,
      providers: [{ provide: AdminService, useValue: adminService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(allow)
      .overrideGuard(AdminGuard)
      .useValue(allow)
      .compile();
    app = module.createNestApplication();
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(() => app.close());

  it('GET /admin/users/export is the CSV export, not a user called "export"', async () => {
    const res = await fetch(`${baseUrl}/admin/users/export`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('csv');
    expect(adminService.getUserById).not.toHaveBeenCalled();
  });

  it('GET /admin/users/:id still reaches the user', async () => {
    const res = await fetch(`${baseUrl}/admin/users/u-1`);
    expect(res.status).toBe(200);
    expect(adminService.getUserById).toHaveBeenCalledWith('u-1');
  });
});
