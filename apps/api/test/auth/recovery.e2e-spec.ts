import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { randomKuwaitPhone, TEST_NAME, TEST_PASSWORD } from '../utils/fixtures';
import { getMockOtpCode } from '../utils/otp';
import { createTestApp } from '../utils/test-app';
import {
  MessageResponseBody,
  VerifyRecoveryOtpResponseBody,
} from '../utils/types';

describe('Password recovery flow (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('resets a password end-to-end: request-otp -> verify-otp -> reset-password -> login', async () => {
    const phone = randomKuwaitPhone();
    await request(app.getHttpServer())
      .post('/users/register/individual')
      .send({ name: TEST_NAME, identifier: phone, password: TEST_PASSWORD })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/recovery/request-otp')
      .send({ identifier: phone })
      .expect(201);

    const otp = getMockOtpCode(app, phone);

    const verifyRes = await request(app.getHttpServer())
      .post('/auth/recovery/verify-otp')
      .send({ identifier: phone, otp })
      .expect(201);
    const verifyBody = verifyRes.body as VerifyRecoveryOtpResponseBody;

    expect(typeof verifyBody.resetToken).toBe('string');

    const newPassword = 'RecoveredPassword789!';
    await request(app.getHttpServer())
      .post('/auth/recovery/reset-password')
      .send({ resetToken: verifyBody.resetToken, newPassword })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: phone, password: TEST_PASSWORD })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: phone, password: newPassword })
      .expect(201);
  });

  it('does not reveal whether an identifier is registered', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/recovery/request-otp')
      .send({ identifier: randomKuwaitPhone() })
      .expect(201);
    const body = res.body as MessageResponseBody;

    expect(body.message).toBe('إذا كان الحساب موجوداً، فسيتم إرسال رمز التحقق');
  });

  it('rejects an invalid OTP on verify-otp with 400', async () => {
    const phone = randomKuwaitPhone();
    await request(app.getHttpServer())
      .post('/users/register/individual')
      .send({ name: TEST_NAME, identifier: phone, password: TEST_PASSWORD })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/recovery/request-otp')
      .send({ identifier: phone })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/recovery/verify-otp')
      .send({ identifier: phone, otp: '000000' })
      .expect(400);
  });

  it('rejects an invalid reset token on reset-password with 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/recovery/reset-password')
      .send({ resetToken: 'not-a-real-token', newPassword: 'Whatever123!' })
      .expect(401);
  });
});
