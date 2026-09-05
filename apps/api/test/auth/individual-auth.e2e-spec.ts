import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import {
  randomEmail,
  randomKuwaitPhone,
  TEST_NAME,
  TEST_PASSWORD,
} from '../utils/fixtures';
import { getMockEmailOtpCode, getMockOtpCode } from '../utils/otp';
import { createTestApp, TestApp } from '../utils/test-app';
import { LoginResponseBody } from '../utils/types';

describe('Individual auth flow (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication<App>;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('registration + OTP verification (email)', () => {
    it('registers with an email identifier, creates no account until the OTP is verified, then logs in', async () => {
      const email = randomEmail();

      const registerRes = await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const registerBody = registerRes.body as {
        otpRequired: boolean;
        identifier: string;
      };
      expect(registerBody.otpRequired).toBe(true);
      expect(registerBody.identifier).toBe(email);

      // No account exists yet — nothing to log into.
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(401);

      const otp = getMockEmailOtpCode(app, email);

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email, otp })
        .expect(201);
      const verifyBody = verifyRes.body as LoginResponseBody;

      expect(typeof verifyBody.access_token).toBe('string');
      expect(verifyBody.access_token.split('.')).toHaveLength(3);
      expect(verifyBody.user.email).toBe(email);
      expect(verifyBody.activeIdentity.type).toBe('INDIVIDUAL');

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const loginBody = loginRes.body as LoginResponseBody;

      expect(typeof loginBody.access_token).toBe('string');
      expect(loginBody.identities).toHaveLength(1);
    });

    it('rejects an invalid OTP with 400 and still creates no account', async () => {
      const email = randomEmail();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email, otp: '000000' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(401);
    });

    it('rejects a duplicate identifier with 409 only once the account actually exists', async () => {
      const email = randomEmail();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const otp = getMockEmailOtpCode(app, email);
      await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email, otp })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
        .expect(409);
    });
  });

  describe('registration + OTP verification (phone)', () => {
    it('registers with a phone identifier, then verifies the OTP to log in', async () => {
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
      const verifyBody = verifyRes.body as LoginResponseBody;

      expect(typeof verifyBody.access_token).toBe('string');
      expect(verifyBody.user.phone).toBe(phone);
    });

    it('rejects an invalid OTP with 400', async () => {
      const phone = randomKuwaitPhone();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: phone, password: TEST_PASSWORD })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register/verify-otp')
        .send({ phone, otp: '000000' })
        .expect(400);
    });
  });

  describe('identity switching', () => {
    it("switches to the caller's own active identity and issues a fresh JWT", async () => {
      const email = randomEmail();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const otp = getMockEmailOtpCode(app, email);
      const verifyRes = await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email, otp })
        .expect(201);
      const { access_token, activeIdentity } =
        verifyRes.body as LoginResponseBody;

      const switchRes = await request(app.getHttpServer())
        .post('/auth/identity/switch')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ identityId: activeIdentity.id })
        .expect(201);
      const switchBody = switchRes.body as LoginResponseBody;

      expect(switchBody.activeIdentity.id).toBe(activeIdentity.id);
      expect(typeof switchBody.access_token).toBe('string');
    });

    it('rejects switching to an identity owned by a different user with 403', async () => {
      const emailA = randomEmail();
      const emailB = randomEmail();

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: emailA, password: TEST_PASSWORD })
        .expect(201);
      const otpA = getMockEmailOtpCode(app, emailA);
      const verifyA = await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email: emailA, otp: otpA })
        .expect(201);
      const verifyABody = verifyA.body as LoginResponseBody;

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ name: TEST_NAME, identifier: emailB, password: TEST_PASSWORD })
        .expect(201);
      const otpB = getMockEmailOtpCode(app, emailB);
      const verifyB = await request(app.getHttpServer())
        .post('/auth/register/verify-email-otp')
        .send({ email: emailB, otp: otpB })
        .expect(201);
      const verifyBBody = verifyB.body as LoginResponseBody;

      await request(app.getHttpServer())
        .post('/auth/identity/switch')
        .set('Authorization', `Bearer ${verifyABody.access_token}`)
        .send({ identityId: verifyBBody.activeIdentity.id })
        .expect(403);
    });

    it('rejects an unauthenticated switch request with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/identity/switch')
        .send({ identityId: 'does-not-matter' })
        .expect(401);
    });
  });

  describe('change password', () => {
    describe('account with a phone on file', () => {
      it('rejects an invalid OTP with 400', async () => {
        const phone = randomKuwaitPhone();
        await request(app.getHttpServer())
          .post('/users/register/individual')
          .send({
            name: TEST_NAME,
            identifier: phone,
            password: TEST_PASSWORD,
          })
          .expect(201);
        const registerOtp = getMockOtpCode(app, phone);
        const verifyRes = await request(app.getHttpServer())
          .post('/auth/register/verify-otp')
          .send({ phone, otp: registerOtp })
          .expect(201);
        const { access_token } = verifyRes.body as LoginResponseBody;

        await request(app.getHttpServer())
          .post('/auth/change-password/request-otp')
          .set('Authorization', `Bearer ${access_token}`)
          .expect(201);

        await request(app.getHttpServer())
          .patch('/auth/change-password')
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            oldPassword: TEST_PASSWORD,
            newPassword: 'NewPassword456!',
            otp: '000000',
          })
          .expect(400);
      });

      it('rejects a missing OTP with 400', async () => {
        const phone = randomKuwaitPhone();
        await request(app.getHttpServer())
          .post('/users/register/individual')
          .send({
            name: TEST_NAME,
            identifier: phone,
            password: TEST_PASSWORD,
          })
          .expect(201);
        const registerOtp = getMockOtpCode(app, phone);
        const verifyRes = await request(app.getHttpServer())
          .post('/auth/register/verify-otp')
          .send({ phone, otp: registerOtp })
          .expect(201);
        const { access_token } = verifyRes.body as LoginResponseBody;

        await request(app.getHttpServer())
          .patch('/auth/change-password')
          .set('Authorization', `Bearer ${access_token}`)
          .send({ oldPassword: TEST_PASSWORD, newPassword: 'NewPassword456!' })
          .expect(400);
      });

      // Regression coverage: changePassword() used to unconditionally delete
      // an OtpCode row that nothing in this app's registration/verify-otp
      // flow ever creates, so even a fully valid attempt 500'd for every
      // real user. Also pinned by a unit test in auth.service.spec.ts.
      it('changes the password end-to-end: request-otp -> change-password -> login', async () => {
        const phone = randomKuwaitPhone();
        await request(app.getHttpServer())
          .post('/users/register/individual')
          .send({
            name: TEST_NAME,
            identifier: phone,
            password: TEST_PASSWORD,
          })
          .expect(201);
        const registerOtp = getMockOtpCode(app, phone);
        const verifyRes = await request(app.getHttpServer())
          .post('/auth/register/verify-otp')
          .send({ phone, otp: registerOtp })
          .expect(201);
        const { access_token } = verifyRes.body as LoginResponseBody;

        await request(app.getHttpServer())
          .post('/auth/change-password/request-otp')
          .set('Authorization', `Bearer ${access_token}`)
          .expect(201);

        const changeOtp = getMockOtpCode(app, phone);
        const newPassword = 'NewPassword456!';
        await request(app.getHttpServer())
          .patch('/auth/change-password')
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            oldPassword: TEST_PASSWORD,
            newPassword,
            otp: changeOtp,
          })
          .expect(200);

        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ identifier: phone, password: TEST_PASSWORD })
          .expect(401);
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ identifier: phone, password: newPassword })
          .expect(201);
      });
    });

    // Regression coverage for the reported bug: an account registered via
    // email (no phone on file) could never change its password, because the
    // client always requested a phone OTP first and the backend always
    // required one — a request that can never succeed with no phone to send
    // it to. Now the old password alone re-authenticates when there's no
    // phone, and the request-otp step is skipped entirely.
    describe('account with no phone on file', () => {
      async function registerAndVerifyEmailAccount(): Promise<{
        email: string;
        access_token: string;
      }> {
        const email = randomEmail();
        await request(app.getHttpServer())
          .post('/users/register/individual')
          .send({ name: TEST_NAME, identifier: email, password: TEST_PASSWORD })
          .expect(201);
        const otp = getMockEmailOtpCode(app, email);
        const verifyRes = await request(app.getHttpServer())
          .post('/auth/register/verify-email-otp')
          .send({ email, otp })
          .expect(201);
        const { access_token } = verifyRes.body as LoginResponseBody;
        return { email, access_token };
      }

      it('changes the password end-to-end with no OTP at all: change-password -> login', async () => {
        const { email, access_token } = await registerAndVerifyEmailAccount();
        const newPassword = 'NewPassword456!';

        await request(app.getHttpServer())
          .patch('/auth/change-password')
          .set('Authorization', `Bearer ${access_token}`)
          .send({ oldPassword: TEST_PASSWORD, newPassword })
          .expect(200);

        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ identifier: email, password: TEST_PASSWORD })
          .expect(401);
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ identifier: email, password: newPassword })
          .expect(201);
      });

      it('rejects an incorrect old password with 400', async () => {
        const { access_token } = await registerAndVerifyEmailAccount();

        await request(app.getHttpServer())
          .patch('/auth/change-password')
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            oldPassword: 'WrongPassword999!',
            newPassword: 'NewPassword456!',
          })
          .expect(400);
      });

      it('rejects an unauthenticated request-otp call for a phone-less account with 400, without ever leaking that as a 500', async () => {
        const { access_token } = await registerAndVerifyEmailAccount();

        // The client no longer calls this for phone-less accounts, but the
        // endpoint itself must still fail cleanly if ever hit directly.
        await request(app.getHttpServer())
          .post('/auth/change-password/request-otp')
          .set('Authorization', `Bearer ${access_token}`)
          .expect(400);
      });
    });
  });

  describe('social login', () => {
    it('creates a brand-new individual identity via Google sign-in', async () => {
      const email = randomEmail();
      testApp.mockGoogleAuthService.verifyIdToken.mockResolvedValueOnce({
        providerId: `google-${Date.now()}`,
        email,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-token' })
        .expect(201);
      const body = res.body as LoginResponseBody;

      expect(body.user.email).toBe(email);
      expect(body.activeIdentity.type).toBe('INDIVIDUAL');
    });

    it('creates a brand-new individual identity via Apple sign-in', async () => {
      const email = randomEmail();
      testApp.mockAppleAuthService.verifyIdentityToken.mockResolvedValueOnce({
        providerId: `apple-${Date.now()}`,
        email,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/apple')
        .send({ identityToken: 'fake-token' })
        .expect(201);
      const body = res.body as LoginResponseBody;

      expect(body.user.email).toBe(email);
      expect(body.activeIdentity.type).toBe('INDIVIDUAL');
    });

    it('logs an existing linked SocialAccount straight in on a repeat sign-in', async () => {
      const email = randomEmail();
      const providerId = `google-${Date.now()}-repeat`;
      testApp.mockGoogleAuthService.verifyIdToken.mockResolvedValueOnce({
        providerId,
        email,
      });
      const firstRes = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-token' })
        .expect(201);
      const firstBody = firstRes.body as LoginResponseBody;

      testApp.mockGoogleAuthService.verifyIdToken.mockResolvedValueOnce({
        providerId,
        email,
      });
      const secondRes = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-token' })
        .expect(201);
      const secondBody = secondRes.body as LoginResponseBody;

      expect(secondBody.user.id).toBe(firstBody.user.id);
    });
  });
});
