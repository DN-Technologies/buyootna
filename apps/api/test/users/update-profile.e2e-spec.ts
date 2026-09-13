import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { randomKuwaitPhone, TEST_NAME, TEST_PASSWORD } from '../utils/fixtures';
import { getMockOtpCode } from '../utils/otp';
import { createTestApp } from '../utils/test-app';
import { LoginResponseBody } from '../utils/types';

describe('Update profile (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndLogin(): Promise<string> {
    const phone = randomKuwaitPhone();
    await request(app.getHttpServer())
      .post('/users/register/individual')
      .send({ name: TEST_NAME, identifier: phone, password: TEST_PASSWORD })
      .expect(201);
    const otp = getMockOtpCode(app, phone);
    const verifyRes = await request(app.getHttpServer())
      .post('/auth/register/verify-otp')
      .send({ phone, otp })
      .expect(201);
    return (verifyRes.body as LoginResponseBody).access_token;
  }

  // Regression coverage for the reported bug: nothing capped the name's
  // length, so an arbitrarily long string got saved and overflowed the
  // profile header/side menu/chat UI wherever the name is displayed.
  it('rejects a name longer than 32 characters with 400', async () => {
    const token = await registerAndLogin();

    await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'a'.repeat(33))
      .expect(400);
  });

  it('accepts a name that is exactly 32 characters', async () => {
    const token = await registerAndLogin();
    const name = 'a'.repeat(32);

    const res = await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('name', name)
      .expect(200);

    expect((res.body as { user: { name: string } }).user.name).toBe(name);
  });

  it('rejects a whitespace-only name with 400', async () => {
    const token = await registerAndLogin();

    await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('name', '    ')
      .expect(400);
  });

  it('leaves the name unchanged when the field is omitted entirely (still optional)', async () => {
    const token = await registerAndLogin();

    await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('phone', '')
      .expect(200);

    const meRes = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect((meRes.body as { user: { name: string } }).user.name).toBe(
      TEST_NAME,
    );
  });
});
