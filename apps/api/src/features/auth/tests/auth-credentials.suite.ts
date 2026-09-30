import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthTestContext, UserUpdateArgs } from './auth-test.harness';
import { INVALID_CREDENTIALS_MESSAGE } from '../services/auth-credentials.service';

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

    it('uses one generic message for an unknown identifier and a wrong password', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue(null);
      const unknown = ctx.service.validateUser(
        'missing@example.com',
        'whatever',
      );
      await expect(unknown).rejects.toThrow(UnauthorizedException);
      await expect(unknown).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);

      ctx.prisma.user.findFirst.mockResolvedValue(dbUser);
      const wrongPassword = ctx.service.validateUser(
        'a@example.com',
        'wrong-password',
      );
      await expect(wrongPassword).rejects.toThrow(UnauthorizedException);
      await expect(wrongPassword).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
    });

    it.each([
      ['disabled', { isDisabled: true }],
      ['blocked', { isBlocked: true }],
    ])(
      'does not reveal a %s account to someone with the wrong password',
      async (_state, flags) => {
        ctx.prisma.user.findFirst.mockResolvedValue({ ...dbUser, ...flags });

        await expect(
          ctx.service.validateUser('a@example.com', 'wrong-password'),
        ).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
      },
    );

    it.each([
      ['disabled', { isDisabled: true }, 'الحساب معطل مؤقتاً'],
      ['blocked', { isBlocked: true }, 'الحساب محظور'],
    ])(
      'tells the owner (right password) that the account is %s',
      async (_state, flags, message) => {
        ctx.prisma.user.findFirst.mockResolvedValue({ ...dbUser, ...flags });

        await expect(
          ctx.service.validateUser('a@example.com', 'correct-password'),
        ).rejects.toThrow(message);
      },
    );

    it('still lets a disabled or blocked admin in with the right password', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue({
        ...dbUser,
        isAdmin: true,
        isDisabled: true,
        isBlocked: true,
      });

      await expect(
        ctx.service.validateUser('a@example.com', 'correct-password'),
      ).resolves.toMatchObject({ id: 'user-1' });
    });

    it('treats an account without a password hash as invalid credentials', async () => {
      ctx.prisma.user.findFirst.mockResolvedValue({ ...dbUser, password: '' });

      await expect(
        ctx.service.validateUser('a@example.com', ''),
      ).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
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

  describe('requestChangePasswordOtp with the current password', () => {
    const phoneUser = {
      id: 'user-1',
      phone: '+96555123456',
    } as unknown as User;

    it('refuses a wrong current password without sending an SMS', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        password: bcrypt.hashSync('old-password', 4),
      });

      await expect(
        ctx.service.requestChangePasswordOtp(phoneUser, 'typo'),
      ).rejects.toThrow('كلمة المرور الحالية غير صحيحة');
      expect(ctx.twilio.sendVerification).not.toHaveBeenCalled();
    });

    it('sends the code once the current password checks out', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({
        password: bcrypt.hashSync('old-password', 4),
      });
      ctx.twilio.sendVerification.mockResolvedValue({ success: true });

      await expect(
        ctx.service.requestChangePasswordOtp(phoneUser, 'old-password'),
      ).resolves.toEqual({ message: 'تم إرسال رمز التحقق بنجاح' });
      expect(ctx.twilio.sendVerification).toHaveBeenCalledWith('+96555123456');
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

    it('refuses a new password equal to the current one', async () => {
      ctx.prisma.user.findUnique.mockResolvedValue({ ...dbUser, phone: null });

      await expect(
        ctx.service.changePassword('user-1', 'old-password', 'old-password'),
      ).rejects.toThrow('كلمة المرور الجديدة يجب أن تختلف عن الحالية');
      expect(ctx.prisma.user.update).not.toHaveBeenCalled();
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
