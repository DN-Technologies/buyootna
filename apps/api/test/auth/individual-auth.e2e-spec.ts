import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import {
  randomEmail,
  randomKuwaitPhone,
  TEST_PASSWORD,
} from '../utils/fixtures';
import { getMockOtpCode } from '../utils/otp';
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

  describe('registration + login (email)', () => {
    it('registers with an email identifier, then logs in with the same credentials', async () => {
      const email = randomEmail();

      const registerRes = await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const registerBody = registerRes.body as { user: { email: string } };

      expect(registerBody.user.email).toBe(email);
      expect(registerBody.user).not.toHaveProperty('password');

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const loginBody = loginRes.body as LoginResponseBody;

      expect(typeof loginBody.access_token).toBe('string');
      expect(loginBody.access_token.split('.')).toHaveLength(3);
      expect(loginBody.activeIdentity.type).toBe('INDIVIDUAL');
      expect(loginBody.identities).toHaveLength(1);
    });

    it('rejects a duplicate identifier with 409', async () => {
      const email = randomEmail();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(409);
    });

    it('rejects a wrong password with 401', async () => {
      const email = randomEmail();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: 'wrong-password' })
        .expect(401);
    });
  });

  describe('registration + OTP verification (phone)', () => {
    it('registers with a phone identifier, then verifies the OTP to log in', async () => {
      const phone = randomKuwaitPhone();

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: phone, password: TEST_PASSWORD })
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
        .send({ identifier: phone, password: TEST_PASSWORD })
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
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: email, password: TEST_PASSWORD })
        .expect(201);
      const { access_token, activeIdentity } =
        loginRes.body as LoginResponseBody;

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
        .send({ identifier: emailA, password: TEST_PASSWORD })
        .expect(201);
      const loginA = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: emailA, password: TEST_PASSWORD })
        .expect(201);
      const loginABody = loginA.body as LoginResponseBody;

      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: emailB, password: TEST_PASSWORD })
        .expect(201);
      const loginB = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: emailB, password: TEST_PASSWORD })
        .expect(201);
      const loginBBody = loginB.body as LoginResponseBody;

      await request(app.getHttpServer())
        .post('/auth/identity/switch')
        .set('Authorization', `Bearer ${loginABody.access_token}`)
        .send({ identityId: loginBBody.activeIdentity.id })
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
    it('rejects an invalid OTP with 400', async () => {
      const phone = randomKuwaitPhone();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: phone, password: TEST_PASSWORD })
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

    // Documents a known, pre-existing bug (also pinned by a unit test in
    // auth.service.spec.ts): changePassword() unconditionally deletes an
    // OtpCode row, but nothing in the registration/verify-otp flow ever
    // creates one — so a real, valid OTP + correct old password still
    // 500s for a typical individual user. Pinned here rather than fixed,
    // since fixing it is outside the scope of this integration-test task.
    it('currently 500s on a valid change-password attempt (missing OtpCode row)', async () => {
      const phone = randomKuwaitPhone();
      await request(app.getHttpServer())
        .post('/users/register/individual')
        .send({ identifier: phone, password: TEST_PASSWORD })
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
      await request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          oldPassword: TEST_PASSWORD,
          newPassword: 'NewPassword456!',
          otp: changeOtp,
        })
        .expect(500);
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
