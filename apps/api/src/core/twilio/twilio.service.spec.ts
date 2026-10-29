import { TwilioService } from './twilio.service';

describe('TwilioService (mock mode)', () => {
  let service: TwilioService;

  beforeEach(() => {
    // Ensure Twilio credentials are NOT set so mock mode is used
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_VERIFY_SERVICE_SID;

    service = new TwilioService();
  });

  describe('formatPhoneNumber', () => {
    it('formats a plain 8-digit Kuwait number to E.164', () => {
      expect(service.formatPhoneNumber('99998888')).toBe('+96599998888');
    });

    it('preserves a number already in E.164 format', () => {
      expect(service.formatPhoneNumber('+96555123456')).toBe('+96555123456');
    });

    it('converts a 00-prefixed number to E.164', () => {
      expect(service.formatPhoneNumber('0096555123456')).toBe('+96555123456');
    });
  });

  describe('sendVerification + checkVerification (mock mode)', () => {
    it('verifies a valid OTP within the TTL window', async () => {
      await service.sendVerification('99998888');

      // Extract the mock OTP from the logger warn output
      const otp = extractMockOtp(service);

      const result = await service.checkVerification('99998888', otp);
      expect(result).toBe(true);
    });

    it('returns false for an incorrect OTP code', async () => {
      await service.sendVerification('99998888');

      const result = await service.checkVerification('99998888', '000000');
      expect(result).toBe(false);
    });

    it('returns false for a phone number that was never sent an OTP', async () => {
      const result = await service.checkVerification('11112222', '123456');
      expect(result).toBe(false);
    });

    it('returns false when the OTP has expired (after 3 minutes)', async () => {
      await service.sendVerification('99998888');
      const otp = extractMockOtp(service);

      // Advance time past the 3-minute TTL
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 4 * 60 * 1000);

      const result = await service.checkVerification('99998888', otp);
      expect(result).toBe(false);

      jest.useRealTimers();
    });

    it('cannot reuse an already-verified OTP (consumed on first use)', async () => {
      await service.sendVerification('99998888');
      const otp = extractMockOtp(service);

      // First verification succeeds
      const first = await service.checkVerification('99998888', otp);
      expect(first).toBe(true);

      // Second verification fails — consumed
      const second = await service.checkVerification('99998888', otp);
      expect(second).toBe(false);
    });

    it('requesting a new OTP invalidates the previous one', async () => {
      await service.sendVerification('99998888');
      const firstOtp = extractMockOtp(service);

      await service.sendVerification('99998888');
      const secondOtp = extractMockOtp(service);

      // Old OTP should no longer work
      const oldResult = await service.checkVerification('99998888', firstOtp);
      expect(oldResult).toBe(false);

      // The new OTP should still work (was not consumed by the failed check above)
      const newResult = await service.checkVerification('99998888', secondOtp);
      expect(newResult).toBe(true);
    });

    it('OTP is still valid just before the 3-minute expiry', async () => {
      await service.sendVerification('99998888');
      const otp = extractMockOtp(service);

      jest.useFakeTimers();
      // 2 minutes 59 seconds — just under the 3-min default
      jest.setSystemTime(Date.now() + 2 * 60 * 1000 + 59 * 1000);

      const result = await service.checkVerification('99998888', otp);
      expect(result).toBe(true);

      jest.useRealTimers();
    });
  });

  /**
   * Extracts the most recent mock OTP from TwilioService's private mockCodes
   * map. Uses the formatted phone number '+96599998888' (the default test number).
   */
  function extractMockOtp(svc: TwilioService): string {
    // Access the private mockCodes Map via bracket notation for testing
    const mockCodes = (svc as unknown as Record<string, unknown>)[
      'mockCodes'
    ] as Map<string, { code: string; expiresAt: Date }>;

    const formattedPhone = svc.formatPhoneNumber('99998888');
    const record = mockCodes.get(formattedPhone);
    if (!record) {
      throw new Error(`No mock OTP found for ${formattedPhone}`);
    }
    return record.code;
  }
});

describe('TwilioService without credentials in production', () => {
  const env = { ...process.env };

  beforeEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_VERIFY_SERVICE_SID;
    delete process.env.ALLOW_MOCK_SMS;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('refuses to "send" a mock code instead of pretending it was sent', async () => {
    const service = new TwilioService();
    await expect(service.sendVerification('51234567')).rejects.toThrow(
      'خدمة الرسائل النصية غير متاحة حالياً',
    );
  });

  it('never accepts a code', async () => {
    const service = new TwilioService();
    await expect(service.checkVerification('51234567', '123456')).resolves.toBe(
      false,
    );
  });

  it('allows mock mode only when explicitly enabled', async () => {
    process.env.ALLOW_MOCK_SMS = 'true';
    const service = new TwilioService();
    await expect(service.sendVerification('51234567')).resolves.toEqual({
      success: true,
    });
  });
});

// QA couldn't see SMS codes on the testing portal: Verify made them. The
// code is now made here and handed to Verify, so الرموز can show it
describe('TwilioService with Twilio Verify', () => {
  function withVerify(create: jest.Mock) {
    const feed = { recordSent: jest.fn(), recordPhoneUsed: jest.fn() };
    const service = new TwilioService(feed as never);
    const client = {
      verify: { v2: { services: () => ({ verifications: { create } }) } },
    };
    Object.assign(service as unknown as Record<string, unknown>, {
      twilioClient: client,
      serviceSid: 'VA123',
    });
    return { service, feed };
  }

  it('sends its own 6-digit code through Verify and lists it on the feed', async () => {
    const create = jest.fn().mockResolvedValue({ status: 'pending' });
    const { service, feed } = withVerify(create);

    await service.sendVerification('96111111', 'SIGNUP' as never);

    const sent = create.mock.calls[0][0];
    expect(sent).toMatchObject({ to: '+96596111111', channel: 'sms' });
    expect(sent.customCode).toMatch(/^\d{6}$/);
    expect(feed.recordSent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'twilio',
        recipient: '+96596111111',
        code: sent.customCode,
      }),
    );
  });

  it("falls back to Verify's own code when custom codes aren't enabled", async () => {
    const create = jest
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('Custom code not allowed'), { code: 60200 }),
      )
      .mockResolvedValueOnce({ status: 'pending' });
    const { service, feed } = withVerify(create);

    await expect(service.sendVerification('96111111')).resolves.toEqual({
      success: true,
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0].customCode).toBeUndefined();
    expect(feed.recordSent).toHaveBeenCalledWith(
      expect.objectContaining({ code: null }),
    );
  });

  it('still fails on other Twilio errors', async () => {
    const create = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Too many requests'), { code: 20429 }));
    const { service, feed } = withVerify(create);

    await expect(service.sendVerification('96111111')).rejects.toThrow(
      'Too many requests',
    );
    expect(create).toHaveBeenCalledTimes(1);
    expect(feed.recordSent).not.toHaveBeenCalled();
  });
});
