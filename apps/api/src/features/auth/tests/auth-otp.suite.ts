import { BadRequestException } from '@nestjs/common';
import { AuthTestContext, MOCK_LOGIN_RESULT } from './auth-test.harness';

export function registerOtpAuthTests(ctx: AuthTestContext) {
  describe('verifyRegistrationOtp', () => {
    it('throws BadRequestException when there is no pending registration for the phone', async () => {
      ctx.phoneRegistrationPending.hasPending.mockReturnValue(false);

      await expect(
        ctx.service.verifyRegistrationOtp('+96555123456', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(ctx.twilio.checkVerification).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the OTP is invalid or expired, without consuming the pending signup', async () => {
      ctx.phoneRegistrationPending.hasPending.mockReturnValue(true);
      ctx.twilio.checkVerification.mockResolvedValue(false);

      await expect(
        ctx.service.verifyRegistrationOtp('+96555123456', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(
        ctx.usersRegistration.completePhoneRegistration,
      ).not.toHaveBeenCalled();
    });

    it('creates the account via UsersRegistrationService then logs the user in on a valid OTP', async () => {
      const createdUser = { id: 'user-1', phone: '+96555123456' };
      ctx.phoneRegistrationPending.hasPending.mockReturnValue(true);
      ctx.twilio.checkVerification.mockResolvedValue(true);
      ctx.usersRegistration.completePhoneRegistration.mockResolvedValue({
        user: createdUser,
        profile: { id: 'profile-1' },
      });
      const loginSpy = jest
        .spyOn(ctx.service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await ctx.service.verifyRegistrationOtp(
        '+96555123456',
        '123456',
      );

      expect(
        ctx.usersRegistration.completePhoneRegistration,
      ).toHaveBeenCalledWith('+96555123456');
      expect(loginSpy).toHaveBeenCalledWith(createdUser, undefined, {});
      expect(result).toBe(MOCK_LOGIN_RESULT);
    });

    it('propagates a failure from account creation without logging in', async () => {
      ctx.phoneRegistrationPending.hasPending.mockReturnValue(true);
      ctx.twilio.checkVerification.mockResolvedValue(true);
      ctx.usersRegistration.completePhoneRegistration.mockRejectedValue(
        new BadRequestException('انتهت جلسة التسجيل، يرجى إعادة المحاولة'),
      );
      const loginSpy = jest.spyOn(ctx.service, 'login');

      await expect(
        ctx.service.verifyRegistrationOtp('+96555123456', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmailRegistrationOtp', () => {
    it('creates the account via UsersRegistrationService then logs the user in', async () => {
      const createdUser = { id: 'user-2', email: 'ali@example.com' };
      ctx.usersRegistration.completeEmailRegistration.mockResolvedValue({
        user: createdUser,
        profile: { id: 'profile-1' },
      });
      const loginSpy = jest
        .spyOn(ctx.service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await ctx.service.verifyEmailRegistrationOtp(
        'ali@example.com',
        '123456',
      );

      expect(
        ctx.usersRegistration.completeEmailRegistration,
      ).toHaveBeenCalledWith('ali@example.com', '123456');
      expect(loginSpy).toHaveBeenCalledWith(createdUser, undefined, {});
      expect(result).toBe(MOCK_LOGIN_RESULT);
    });

    it('propagates BadRequestException from an invalid OTP without logging in', async () => {
      ctx.usersRegistration.completeEmailRegistration.mockRejectedValue(
        new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية'),
      );
      const loginSpy = jest.spyOn(ctx.service, 'login');

      await expect(
        ctx.service.verifyEmailRegistrationOtp('ali@example.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });

  describe('getMockEmailOtp', () => {
    it('delegates to EmailOtpService.getMockOtp', () => {
      ctx.emailOtp.getMockOtp.mockReturnValue('123456');

      const result = ctx.service.getMockEmailOtp('ali@example.com');

      expect(result).toBe('123456');
      expect(ctx.emailOtp.getMockOtp).toHaveBeenCalledWith('ali@example.com');
    });
  });
}
