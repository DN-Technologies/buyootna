import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthTestContext, UserUpdateArgs } from './auth-test.harness';

export function registerCredentialsAuthTests(ctx: AuthTestContext) {
  describe('validateUser', () => {
    const storedHash = bcrypt.hashSync('correct-password', 10);
    const dbUser = {
      id: 'user-1',
      email: 'a@example.com',
      phone: null,
      password: storedHash,
      isDisabled: false,
    };

    it('returns the user without the password when identifier and password match', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue(dbUser);

      const result = await ctx.service.validateUser(
        'a@example.com',
        'correct-password',
      );

      expect(ctx.prisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'a@example.com' }, { phone: 'a@example.com' }] },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 'user-1' });
    });

    it('throws UnauthorizedException when no user matches the identifier', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        ctx.service.validateUser('missing@example.com', 'whatever'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the account is disabled, without checking the password', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue({
        ...dbUser,
        isDisabled: true,
      });

      await expect(
        ctx.service.validateUser('a@example.com', 'correct-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue(dbUser);

      await expect(
        ctx.service.validateUser('a@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestChangePasswordOtp', () => {
    it('throws BadRequestException when the user has no phone on file', async () => {
      await expect(
        ctx.service.requestChangePasswordOtp({
          phone: null,
        } as unknown as User),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends a verification OTP and returns a success message', async () => {
      ctx.twilio.sendVerification.mockResolvedValue({ success: true });

      const result = await ctx.service.requestChangePasswordOtp({
        phone: '+96555123456',
      } as unknown as User);

      expect(ctx.twilio.sendVerification).toHaveBeenCalledWith('+96555123456');
      expect(result).toEqual({ message: 'تم إرسال رمز التحقق بنجاح' });
    });

    it('translates a Twilio send failure into a handled error instead of a raw 500', async () => {
      // E.g. a trial-account recipient limit, a non-E.164 phone on file, or
      // a provider outage -- whatever Twilio rejects with must reach the
      // client as the handled Arabic error, not an unhandled exception.
      ctx.twilio.sendVerification.mockRejectedValue(
        new Error('Twilio: number is not verified'),
      );

      await expect(
        ctx.service.requestChangePasswordOtp({
          phone: '+96555123456',
        } as unknown as User),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        ctx.service.requestChangePasswordOtp({
          phone: '+96555123456',
        } as unknown as User),
      ).rejects.toThrow('تعذر إرسال رمز التحقق');
    });
  });

  describe('changePassword', () => {
    const storedHash = bcrypt.hashSync('old-password', 10);
    const dbUser = {
      id: 'user-1',
      phone: '+96555123456',
      password: storedHash,
    };

    it('throws BadRequestException when the user is not found', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        ctx.service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('changes the password without an OTP when the user has no phone on file', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        ...dbUser,
        phone: null,
      });
      ctx.prisma.user.update.mockResolvedValue({
        ...dbUser,
        phone: null,
        password: 'new-hash',
      });

      const result = await ctx.service.changePassword(
        'user-1',
        'old-password',
        'new-password',
      );

      expect(ctx.twilio.checkVerification).not.toHaveBeenCalled();
      expect(ctx.prisma.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'تم تغيير كلمة المرور بنجاح' });
    });

    it('throws BadRequestException when the user has a phone but no OTP is provided', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);

      await expect(
        ctx.service.changePassword('user-1', 'old-password', 'new-password'),
      ).rejects.toThrow(BadRequestException);
      expect(ctx.twilio.checkVerification).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the OTP is invalid', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);
      ctx.twilio.checkVerification.mockResolvedValue(false);

      await expect(
        ctx.service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '000000',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the old password does not match', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);
      ctx.twilio.checkVerification.mockResolvedValue(true);

      await expect(
        ctx.service.changePassword(
          'user-1',
          'wrong-old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('hashes and persists the new password on success', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);
      ctx.twilio.checkVerification.mockResolvedValue(true);
      ctx.prisma.user.update.mockResolvedValue({
        ...dbUser,
        password: 'new-hash',
      });

      const result = await ctx.service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
      );

      expect(ctx.prisma.user.update).toHaveBeenCalledTimes(1);
      const updateCalls = ctx.prisma.user.update.mock
        .calls as UserUpdateArgs[][];
      const updateArgs = updateCalls[0][0];
      expect(updateArgs.where).toEqual({ id: 'user-1' });
      expect(updateArgs.data.password).not.toBe('new-password');
      expect(bcrypt.compareSync('new-password', updateArgs.data.password)).toBe(
        true,
      );
      // Lets JwtStrategy reject legacy no-sid tokens issued before this
      // moment (the revocation gap for tokens predating the sid claim).
      expect(updateArgs.data.passwordChangedAt).toBeInstanceOf(Date);
      expect(result).toEqual({ message: 'تم تغيير كلمة المرور بنجاح' });
    });

    // The "most recent" vs. "exact currentSessionId" heuristic itself now
    // lives in SessionsService and is covered by sessions.service.spec.ts --
    // these just check AuthService delegates to it correctly.
    it('delegates to SessionsService.deleteAllExceptCurrent when logoutAllDevices is true', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);
      ctx.twilio.checkVerification.mockResolvedValue(true);
      ctx.prisma.user.update.mockResolvedValue(dbUser);

      await ctx.service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
        true,
        'session-current',
      );

      expect(ctx.sessions.deleteAllExceptCurrent).toHaveBeenCalledWith(
        'user-1',
        'session-current',
      );
    });

    it('never touches sessions when logoutAllDevices is falsy or omitted', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue(dbUser);
      ctx.twilio.checkVerification.mockResolvedValue(true);
      ctx.prisma.user.update.mockResolvedValue(dbUser);

      await ctx.service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
      );

      expect(ctx.sessions.deleteAllExceptCurrent).not.toHaveBeenCalled();
    });
  });
}
