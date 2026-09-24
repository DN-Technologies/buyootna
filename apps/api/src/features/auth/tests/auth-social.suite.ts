import { SocialProvider } from '@prisma/client';
import {
  AuthTestContext,
  MOCK_LOGIN_RESULT,
  SocialAccountCreateArgs,
  IdentityCreateArgs,
  buildTx,
  Tx,
} from './auth-test.harness';

export function registerSocialAuthTests(ctx: AuthTestContext) {
  describe('loginOrRegisterWithSocial', () => {
    it('logs in directly when a SocialAccount link already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'a@example.com',
        password: 'hashed',
      };
      ctx.prisma.socialAccount.findUnique.mockResolvedValue({
        id: 'link-1',
        user: existingUser,
      });
      const loginSpy = jest
        .spyOn(ctx.sessionService, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await ctx.service.loginOrRegisterWithSocial(
        SocialProvider.GOOGLE,
        {
          providerId: 'google-sub-1',
          email: 'a@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1' }),
        undefined,
        {},
      );
      expect(ctx.prisma.socialAccount.create).not.toHaveBeenCalled();
      expect(ctx.prisma.$transaction).not.toHaveBeenCalled();
    });

    it('links an existing user found by email when no SocialAccount link exists yet', async () => {
      ctx.prisma.socialAccount.findUnique.mockResolvedValue(null);
      const existingUser = {
        id: 'user-2',
        email: 'b@example.com',
        password: 'hashed',
      };
      ctx.prisma.user.findUnique.mockResolvedValue(existingUser);
      const loginSpy = jest
        .spyOn(ctx.sessionService, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await ctx.service.loginOrRegisterWithSocial(
        SocialProvider.APPLE,
        {
          providerId: 'apple-sub-1',
          email: 'b@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(ctx.prisma.socialAccount.create).toHaveBeenCalledTimes(1);
      const socialAccountCreateCalls = ctx.prisma.socialAccount.create.mock
        .calls as SocialAccountCreateArgs[][];
      const createArgs = socialAccountCreateCalls[0][0];
      expect(createArgs.data).toMatchObject({
        userId: 'user-2',
        provider: SocialProvider.APPLE,
        providerId: 'apple-sub-1',
      });
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-2' }),
        undefined,
        {},
      );
    });

    it('creates a brand-new User + IndividualProfile + Identity + SocialAccount when nothing matches', async () => {
      ctx.prisma.socialAccount.findUnique.mockResolvedValue(null);
      ctx.prisma.user.findUnique.mockResolvedValue(null);
      const loginSpy = jest
        .spyOn(ctx.sessionService, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      let tx: Tx | undefined;
      ctx.prisma.$transaction.mockImplementation((cb: (tx: Tx) => unknown) => {
        tx = buildTx();
        return cb(tx);
      });

      const result = await ctx.service.loginOrRegisterWithSocial(
        SocialProvider.GOOGLE,
        {
          providerId: 'google-sub-2',
          email: 'social@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-user-1' }),
        undefined,
        {},
      );
      // Regression guard for the earlier bug class: registration must create an Identity row,
      // not just a User, or /auth/login breaks immediately after signup.
      expect(tx!.user.create).toHaveBeenCalled();
      expect(tx!.individualProfile.create).toHaveBeenCalled();
      const identityCreateCalls = tx!.identity.create.mock
        .calls as IdentityCreateArgs[][];
      const identityArgs = identityCreateCalls[0][0];
      expect(identityArgs.data).toMatchObject({ isActive: true });
      const socialAccountCreateCalls = tx!.socialAccount.create.mock
        .calls as SocialAccountCreateArgs[][];
      const socialAccountArgs = socialAccountCreateCalls[0][0];
      expect(socialAccountArgs.data).toMatchObject({
        provider: SocialProvider.GOOGLE,
        providerId: 'google-sub-2',
      });
    });
  });
}
