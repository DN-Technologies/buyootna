import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { randomKuwaitPhone, TEST_NAME, TEST_PASSWORD } from '../utils/fixtures';
import { getMockOtpCode } from '../utils/otp';
import { createTestApp } from '../utils/test-app';
import { LoginResponseBody, SessionResponseBody } from '../utils/types';

describe('Devices / active sessions (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // Registration's verify-otp step also logs the user in (via
  // AuthService.login), so it creates a Session row exactly like any other
  // login endpoint. A real mobile client always sends its device headers on
  // every request, so registering "from device A" and then separately
  // logging in "from device A" refreshes the same row rather than creating
  // a second one -- that's the behavior these tests rely on.
  async function registerUser(
    deviceId: string,
    platform: 'ios' | 'android',
  ): Promise<string> {
    const phone = randomKuwaitPhone();
    await request(app.getHttpServer())
      .post('/users/register/individual')
      .send({ name: TEST_NAME, identifier: phone, password: TEST_PASSWORD })
      .expect(201);
    const otp = getMockOtpCode(app, phone);
    await request(app.getHttpServer())
      .post('/auth/register/verify-otp')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Platform', platform)
      .send({ phone, otp })
      .expect(201);
    return phone;
  }

  async function loginFromDevice(
    phone: string,
    deviceId: string,
    platform: 'ios' | 'android',
    deviceModel?: string,
  ): Promise<LoginResponseBody> {
    const req = request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Platform', platform);
    if (deviceModel) {
      req.set('X-Device-Model', deviceModel);
    }
    const res = await req
      .send({ identifier: phone, password: TEST_PASSWORD })
      .expect(201);
    return res.body as LoginResponseBody;
  }

  async function getDevices(token: string): Promise<SessionResponseBody[]> {
    const res = await request(app.getHttpServer())
      .get('/devices')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return res.body as SessionResponseBody[];
  }

  it('lists a session per distinct device, each with the correct platform', async () => {
    const phone = await registerUser('device-a', 'ios');

    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    await loginFromDevice(phone, 'device-b', 'android');

    const sessions = await getDevices(deviceA.access_token);

    expect(sessions).toHaveLength(2);
    const platforms = sessions.map((s) => s.platform).sort();
    expect(platforms).toEqual(['android', 'ios']);
  });

  it('records the device model when the client sends X-Device-Model, falling back to a generic label otherwise', async () => {
    const phone = await registerUser('device-a', 'ios');

    await loginFromDevice(phone, 'device-a', 'ios', 'iPhone 13 Pro Max');
    const deviceB = await loginFromDevice(phone, 'device-b', 'android');

    const sessions = await getDevices(deviceB.access_token);

    const deviceASession = sessions.find((s) => s.platform === 'ios');
    const deviceBSession = sessions.find((s) => s.platform === 'android');
    expect(deviceASession?.deviceModel).toBe('iPhone 13 Pro Max');
    expect(deviceASession?.deviceName).toBe('iPhone 13 Pro Max');
    expect(deviceBSession?.deviceModel).toBeNull();
    expect(deviceBSession?.deviceName).toBe('جهاز أندرويد');
  });

  it('upserts by deviceId: logging in twice from the same device refreshes one row, not two', async () => {
    const phone = await registerUser('device-same', 'ios');

    const first = await loginFromDevice(phone, 'device-same', 'ios');
    const second = await loginFromDevice(phone, 'device-same', 'ios');

    expect(second.sessionId).toBe(first.sessionId);

    const sessions = await getDevices(second.access_token);
    expect(sessions).toHaveLength(1);
  });

  it('lets one device revoke another device by session id', async () => {
    const phone = await registerUser('device-a', 'ios');

    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    const deviceB = await loginFromDevice(phone, 'device-b', 'android');

    await request(app.getHttpServer())
      .delete(`/devices/${deviceB.sessionId}`)
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .expect(200);

    const sessions = await getDevices(deviceA.access_token);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(deviceA.sessionId);
  });

  // Regression coverage for the reported Critical security bug: revoking a
  // device used to only delete its Session row, while the device's JWT kept
  // authenticating until expiry -- the revoked device retained full access.
  it('revoking a device invalidates its token: the revoked device gets 401 on its next request', async () => {
    const phone = await registerUser('device-a', 'ios');

    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    const deviceB = await loginFromDevice(phone, 'device-b', 'android');

    await request(app.getHttpServer())
      .delete(`/devices/${deviceB.sessionId}`)
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .expect(200);

    // Device B's now-orphaned JWT must stop authenticating immediately.
    await request(app.getHttpServer())
      .get('/devices')
      .set('Authorization', `Bearer ${deviceB.access_token}`)
      .expect(401);

    // Device A's own session must keep working.
    const sessions = await getDevices(deviceA.access_token);
    expect(sessions).toHaveLength(1);
  });

  // Regression coverage: revokeAllExceptCurrent used to keep whichever
  // session was most-recently-active rather than the caller's own session,
  // so a caller on an older device would get revoked instead of the other
  // devices it meant to log out. Logging in on device B *after* device A
  // makes B the more-recently-active session -- calling revoke-all from A
  // must still keep A.
  it('revoke-all-except-current keeps the calling device even when another device logged in more recently', async () => {
    const phone = await registerUser('device-a', 'ios');

    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    await loginFromDevice(phone, 'device-b', 'android');

    await request(app.getHttpServer())
      .delete('/devices')
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .expect(200);

    const sessions = await getDevices(deviceA.access_token);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(deviceA.sessionId);
  });

  it('logging out (DELETE /devices/:ownSessionId) removes that device from the list', async () => {
    const phone = await registerUser('device-a', 'ios');

    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    const deviceB = await loginFromDevice(phone, 'device-b', 'android');

    await request(app.getHttpServer())
      .delete(`/devices/${deviceA.sessionId}`)
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .expect(200);

    const sessions = await getDevices(deviceB.access_token);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(deviceB.sessionId);
  });

  it('switching identity does not create a second session for the same device', async () => {
    const phone = await registerUser('device-a', 'ios');
    const device = await loginFromDevice(phone, 'device-a', 'ios');

    const switchRes = await request(app.getHttpServer())
      .post('/auth/identity/switch')
      .set('Authorization', `Bearer ${device.access_token}`)
      .send({ identityId: device.activeIdentity.id })
      .expect(201);
    const switchBody = switchRes.body as LoginResponseBody;

    expect(switchBody.sessionId).toBe(device.sessionId);

    const sessions = await getDevices(switchBody.access_token);
    expect(sessions).toHaveLength(1);
  });

  it('changing password with logoutAllDevices removes other sessions but keeps the caller', async () => {
    const phone = await registerUser('device-a', 'ios');
    const deviceA = await loginFromDevice(phone, 'device-a', 'ios');
    await loginFromDevice(phone, 'device-b', 'android');

    await request(app.getHttpServer())
      .post('/auth/change-password/request-otp')
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .expect(201);
    const changeOtp = getMockOtpCode(app, phone);

    await request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${deviceA.access_token}`)
      .send({
        oldPassword: TEST_PASSWORD,
        newPassword: 'NewPassword456!',
        otp: changeOtp,
        logoutAllDevices: true,
      })
      .expect(200);

    // The old token for device A is still valid (JWTs aren't revoked on
    // password change) -- confirm A's own session survived and B's did not.
    const sessions = await getDevices(deviceA.access_token);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(deviceA.sessionId);
  });
});
