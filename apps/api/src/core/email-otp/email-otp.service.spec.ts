import { EmailOtpService } from './email-otp.service';
import { MailService } from '../mail/mail.service';

describe('EmailOtpService', () => {
  let service: EmailOtpService;
  let mockMailService: { isMockMode: boolean; sendMail: jest.Mock };

  beforeEach(() => {
    mockMailService = {
      isMockMode: true,
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    service = new EmailOtpService(mockMailService as unknown as MailService);
  });

  /** Helper: reads the OTP from the in-memory pending map via getMockOtp. */
  function getOtpFor(email: string): string {
    const otp = service.getMockOtp(email);
    if (!otp) throw new Error(`No pending OTP found for ${email}`);
    return otp;
  }

  describe('sendRegistrationOtp + verifyAndConsume', () => {
    it('verifies a valid OTP within the TTL window', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const otp = getOtpFor('ali@example.com');

      const result = service.verifyAndConsume('ali@example.com', otp);

      expect(result).toEqual({
        name: 'Ali',
        hashedPassword: 'hashed-pw',
      });
    });

    it('returns null for an incorrect OTP code', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');

      const result = service.verifyAndConsume('ali@example.com', '000000');

      expect(result).toBeNull();
    });

    it('returns null for a non-existent email', () => {
      const result = service.verifyAndConsume('nobody@example.com', '123456');

      expect(result).toBeNull();
    });

    it('returns null when the OTP has expired (after 3 minutes)', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const otp = getOtpFor('ali@example.com');

      // Advance time past the 3-minute TTL
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 4 * 60 * 1000);

      const result = service.verifyAndConsume('ali@example.com', otp);

      expect(result).toBeNull();
      jest.useRealTimers();
    });

    it('cannot reuse an already-verified OTP (consumed on first use)', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const otp = getOtpFor('ali@example.com');

      // First verification succeeds
      const first = service.verifyAndConsume('ali@example.com', otp);
      expect(first).not.toBeNull();

      // Second verification fails — the entry was consumed
      const second = service.verifyAndConsume('ali@example.com', otp);
      expect(second).toBeNull();
    });

    it('requesting a new OTP invalidates the previous one', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const firstOtp = getOtpFor('ali@example.com');

      // Send a new OTP — overwrites the old one
      await service.sendRegistrationOtp(
        'ali@example.com',
        'Ali',
        'hashed-pw-2',
      );
      const secondOtp = getOtpFor('ali@example.com');

      // Old OTP no longer works (new entry replaced it)
      const oldResult = service.verifyAndConsume('ali@example.com', firstOtp);
      expect(oldResult).toBeNull();

      // New OTP works — re-send since the failed verify above didn't consume
      // but we need the entry back in the map (it's still there since oldResult was null)
      const newResult = service.verifyAndConsume('ali@example.com', secondOtp);
      expect(newResult).toEqual({
        name: 'Ali',
        hashedPassword: 'hashed-pw-2',
      });
    });
  });

  describe('hasPending', () => {
    it('returns true for a pending, non-expired entry', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');

      expect(service.hasPending('ali@example.com')).toBe(true);
    });

    it('returns false when no entry exists', () => {
      expect(service.hasPending('nobody@example.com')).toBe(false);
    });

    it('returns false when the entry has expired', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');

      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 4 * 60 * 1000);

      expect(service.hasPending('ali@example.com')).toBe(false);
      jest.useRealTimers();
    });
  });

  describe('getMockOtp', () => {
    it('returns the OTP when mail is in mock mode', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');

      const otp = service.getMockOtp('ali@example.com');
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('returns null when mail is NOT in mock mode', async () => {
      mockMailService.isMockMode = false;

      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');

      expect(service.getMockOtp('ali@example.com')).toBeNull();
    });
  });

  describe('sendPasswordResetOtp + verifyPasswordResetOtp', () => {
    it('verifies a valid reset OTP within the TTL window', async () => {
      await service.sendPasswordResetOtp('ali@example.com', 'Ali');
      const otp = service.getMockPasswordResetOtp('ali@example.com');
      expect(otp).toMatch(/^\d{6}$/);

      const result = service.verifyPasswordResetOtp('ali@example.com', otp!);

      expect(result).toBe(true);
    });

    it('returns false for an incorrect reset OTP code', async () => {
      await service.sendPasswordResetOtp('ali@example.com', 'Ali');

      const result = service.verifyPasswordResetOtp(
        'ali@example.com',
        '000000',
      );

      expect(result).toBe(false);
    });

    it('returns false for an email with no pending reset', () => {
      const result = service.verifyPasswordResetOtp(
        'nobody@example.com',
        '123456',
      );

      expect(result).toBe(false);
    });

    it('cannot reuse an already-verified reset OTP', async () => {
      await service.sendPasswordResetOtp('ali@example.com', 'Ali');
      const otp = service.getMockPasswordResetOtp('ali@example.com')!;

      expect(service.verifyPasswordResetOtp('ali@example.com', otp)).toBe(true);
      expect(service.verifyPasswordResetOtp('ali@example.com', otp)).toBe(
        false,
      );
    });

    it('is independent from a pending registration OTP for the same email', async () => {
      // Force distinct 6-digit codes so this isn't flaky-by-construction.
      const randomSpy = jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // -> registration OTP "190000"
        .mockReturnValueOnce(0.9); // -> reset OTP "910000"

      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      await service.sendPasswordResetOtp('ali@example.com', 'Ali');
      randomSpy.mockRestore();

      const registrationOtp = service.getMockOtp('ali@example.com')!;
      const resetOtp = service.getMockPasswordResetOtp('ali@example.com')!;
      expect(registrationOtp).not.toEqual(resetOtp);

      // The registration OTP must not verify as a password-reset OTP, and
      // sending a reset OTP must not have disturbed the pending signup.
      expect(
        service.verifyPasswordResetOtp('ali@example.com', registrationOtp),
      ).toBe(false);
      expect(service.hasPending('ali@example.com')).toBe(true);
    });

    it('getMockPasswordResetOtp returns null when mail is NOT in mock mode', async () => {
      mockMailService.isMockMode = false;

      await service.sendPasswordResetOtp('ali@example.com', 'Ali');

      expect(service.getMockPasswordResetOtp('ali@example.com')).toBeNull();
    });
  });

  describe('configurable TTL', () => {
    it('OTP is still valid just before the 3-minute default expiry', async () => {
      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const otp = getOtpFor('ali@example.com');

      jest.useFakeTimers();
      // 2 minutes 59 seconds — just under the 3-min default
      jest.setSystemTime(Date.now() + 2 * 60 * 1000 + 59 * 1000);

      const result = service.verifyAndConsume('ali@example.com', otp);
      expect(result).not.toBeNull();
      jest.useRealTimers();
    });

    it('OTP expires just past the 3-minute boundary', async () => {
      const now = Date.now();
      jest.useFakeTimers();
      jest.setSystemTime(now);

      await service.sendRegistrationOtp('ali@example.com', 'Ali', 'hashed-pw');
      const otp = getOtpFor('ali@example.com');

      // Advance 1ms past the TTL — expiresAt is now strictly in the past
      jest.setSystemTime(now + 3 * 60 * 1000 + 1);

      const result = service.verifyAndConsume('ali@example.com', otp);
      expect(result).toBeNull();
      jest.useRealTimers();
    });
  });
});
