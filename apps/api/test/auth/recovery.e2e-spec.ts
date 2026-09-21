import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import {
  randomEmail,
  randomKuwaitPhone,
  TEST_NAME,
  TEST_PASSWORD,
} from '../utils/fixtures';
import {
  getMockEmailOtpCode,
  getMockOtpCode,
  getMockPasswordResetOtpCode,
} from '../utils/otp';
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

  // Registration defers account creation until the OTP verifies, so a
  // fixture user only exists once the phone signup flow is completed.
  async function registerAndVerifyPhoneAccount(
    phone: string,
    password: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .post('/users/register/individual')
      .send({ name: TEST_NAME, identifier: phone, password })
      .expect(201);

    const signupOtp = getMockOtpCode(app, phone);
    await request(app.getHttpServer())
      .post('/auth/register/verify-otp')
      .send({ phone, otp: signupOtp })
      .expect(201);
  }

  it('resets a password end-to-end: request-otp -> verify-otp -> reset-password -> login', async () => {
    const phone = randomKuwaitPhone();
    await registerAndVerifyPhoneAccount(phone, TEST_PASSWORD);

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
    await registerAndVerifyPhoneAccount(phone, TEST_PASSWORD);

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

  // Regression coverage for the reported Critical bug: RecoveryService
  // previously only ever sent an OTP over Twilio SMS, gated on the found
  // user having a `phone` on file. An account registered with only an
  // email identifier (the entire email-signup path this app supports)
  // silently fell through that check -- no OTP was ever sent, while the
  // endpoint still reported success, permanently blocking recovery.
  describe('email-only account', () => {
    async function registerAndVerifyEmailAccount(
      email: string,
      password: string,
    ): Promise<void> {
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password })
        .expect(201);

      const signupOtp = getMockEmailOtpCode(app, email);
      await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email, otp: signupOtp })
        .expect(201);
    }

    it('actually sends a password-reset OTP (previously sent nothing)', async () => {
      const email = randomEmail();
      await registerAndVerifyEmailAccount(email, TEST_PASSWORD);

      await request(app.getHttpServer())
        .post('/auth/recovery/request-otp')
        .send({ identifier: email })
        .expect(201);

      // Before the fix, no OTP was ever generated for an email-only
      // account, so this would throw ("no pending OTP found").
      expect(() => getMockPasswordResetOtpCode(app, email)).not.toThrow();
    });

    it('resets a password end-to-end via the email OTP channel: request-otp -> verify-otp -> reset-password -> login', async () => {
      const email = randomEmail();
      await registerAndVerifyEmailAccount(email, TEST_PASSWORD);

      await request(app.getHttpServer())
        .post('/auth/recovery/request-otp')
        .send({ identifier: email })
        .expect(201);

      const otp = getMockPasswordResetOtpCode(app, email);

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: email, otp })
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
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: newPassword })
        .expect(201);
    });

    it('rejects an invalid OTP on verify-otp with 400', async () => {
      const email = randomEmail();
      await registerAndVerifyEmailAccount(email, TEST_PASSWORD);

      await request(app.getHttpServer())
        .post('/auth/recovery/request-otp')
        .send({ identifier: email })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: email, otp: '000000' })
        .expect(400);
    });

    it('does not leak a phone-account OTP into the email channel or vice versa', async () => {
      const email = randomEmail();
      await registerAndVerifyEmailAccount(email, TEST_PASSWORD);

      const phone = randomKuwaitPhone();
      await registerAndVerifyPhoneAccount(phone, TEST_PASSWORD);

      await request(app.getHttpServer())
        .post('/auth/recovery/request-otp')
        .send({ identifier: email })
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/recovery/request-otp')
        .send({ identifier: phone })
        .expect(201);

      const emailOtp = getMockPasswordResetOtpCode(app, email);
      const phoneOtp = getMockOtpCode(app, phone);

      // The phone account's SMS OTP must not verify against the email
      // account's identifier, and vice versa.
      await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: email, otp: phoneOtp })
        .expect(400);
      await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: phone, otp: emailOtp })
        .expect(400);

      // Both still work correctly with their own OTP.
      await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: email, otp: emailOtp })
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/recovery/verify-otp')
        .send({ identifier: phone, otp: phoneOtp })
        .expect(201);
    });
  });
});
