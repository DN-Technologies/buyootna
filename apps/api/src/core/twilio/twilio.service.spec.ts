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

    it('returns false when the OTP has expired', async () => {
      await service.sendVerification('99998888');
      const otp = extractMockOtp(service);

      // Advance time past the 5-minute TTL
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 6 * 60 * 1000);

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

    it('OTP is still valid just before the 5-minute expiry', async () => {
      await service.sendVerification('99998888');
      const otp = extractMockOtp(service);

      jest.useFakeTimers();
      // 4 minutes 59 seconds — just under the 5-min default
      jest.setSystemTime(Date.now() + 4 * 60 * 1000 + 59 * 1000);

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
