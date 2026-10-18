import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { IdentityType, type User } from '@prisma/client';
import { AuthTestContext } from './auth-test.harness';

export function registerLoginAuthTests(ctx: AuthTestContext) {
  describe('login', () => {
    const user = { id: 'user-1', email: 'a@example.com' } as unknown as Omit<
      User,
      'password'
    >;
    const buildIdentity = (overrides: Record<string, unknown> = {}) => ({
      id: 'identity-1',
      userId: 'user-1',
      type: IdentityType.INDIVIDUAL,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      ...overrides,
    });

    it('uses the specified identityId, scoped to id + userId', async () => {
      const identity = buildIdentity({ id: 'identity-2' });
      ctx.identities.findById.mockResolvedValue(identity);

      const result = await ctx.service.login(user, 'identity-2');

      expect(ctx.identities.findById).toHaveBeenCalledWith(
        'identity-2',
        'user-1',
      );
      expect(result.activeIdentity).toEqual(identity);
      expect(ctx.jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        ident: 'identity-2',
        type: IdentityType.INDIVIDUAL,
        sid: 'session-1',
      });
    });

    describe('with the persona picked on the login screen (identityType)', () => {
      it('opens that persona directly: its id and type go in the JWT', async () => {
        const office = buildIdentity({
          id: 'identity-office',
          type: IdentityType.OFFICE,
          isActive: false,
        });
        ctx.identities.findByType.mockResolvedValueOnce(office);
        ctx.identities.findById.mockResolvedValueOnce(office);

        const result = await ctx.service.login(
          user,
          undefined,
          { deviceId: 'device-1' },
          { identityType: IdentityType.OFFICE },
        );

        expect(ctx.identities.findByType).toHaveBeenCalledWith(
          'user-1',
          IdentityType.OFFICE,
          'device-1',
        );
        // Resolved through the same owner-scoped lookup as an explicit id
        expect(ctx.identities.findById).toHaveBeenCalledWith(
          'identity-office',
          'user-1',
        );
        expect(result.activeIdentity).toMatchObject({
          id: 'identity-office',
          type: IdentityType.OFFICE,
        });
        expect(ctx.jwt.sign).toHaveBeenCalledWith({
          sub: 'user-1',
          ident: 'identity-office',
          type: IdentityType.OFFICE,
          sid: 'session-1',
        });
        // The device and the account remember it for the next plain login
        expect(ctx.identities.markLastUsed).toHaveBeenCalledWith(
          'user-1',
          'identity-office',
        );
      });

      it("refuses a type the account doesn't have, listing the ones it does", async () => {
        ctx.identities.findByType.mockResolvedValueOnce(null);
        ctx.identities.listAll.mockResolvedValueOnce([
          buildIdentity({ type: IdentityType.INDIVIDUAL }),
          buildIdentity({ id: 'identity-c', type: IdentityType.COMPANY }),
        ]);

        const attempt = ctx.service.login(
          user,
          undefined,
          {},
          {
            identityType: IdentityType.OFFICE,
          },
        );

        await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
        await attempt.catch((error: ForbiddenException) => {
          expect(error.getResponse()).toMatchObject({
            code: 'IDENTITY_TYPE_NOT_FOUND',
            requestedType: IdentityType.OFFICE,
            availableTypes: [IdentityType.INDIVIDUAL, IdentityType.COMPANY],
          });
        });
        // No session and no token for a persona that wasn't opened
        expect(ctx.sessions.upsertSession).not.toHaveBeenCalled();
        expect(ctx.jwt.sign).not.toHaveBeenCalled();
      });

      it('still refuses a blocked account before looking at the type', async () => {
        const blocked = { ...user, isBlocked: true } as typeof user;

        await expect(
          ctx.service.login(
            blocked,
            undefined,
            {},
            {
              identityType: IdentityType.COMPANY,
            },
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(ctx.identities.findByType).not.toHaveBeenCalled();
      });
    });

    it('sends the new-login alert when the session is on a new device', async () => {
      ctx.identities.findActive.mockResolvedValueOnce(buildIdentity());
      ctx.sessions.upsertSession.mockResolvedValueOnce({
        id: 'session-new',
        deviceName: 'iPhone 15',
        isNewDevice: true,
      });

      const result = await ctx.service.login(user);

      expect(ctx.loginAlerts.notifyNewDeviceLogin).toHaveBeenCalledWith(
        'user-1',
        { id: 'session-new', deviceName: 'iPhone 15' },
      );
      expect(result.sessionId).toBe('session-new');
    });

    it('does not alert when the device has logged in before', async () => {
      ctx.identities.findActive.mockResolvedValueOnce(buildIdentity());
      ctx.sessions.upsertSession.mockResolvedValueOnce({
        id: 'session-1',
        isNewDevice: false,
      });

      await ctx.service.login(user);

      expect(ctx.loginAlerts.notifyNewDeviceLogin).not.toHaveBeenCalled();
    });

    it('falls back to the currently active identity when no identityId is provided', async () => {
      const activeIdentity = buildIdentity({ isActive: true });
      ctx.identities.findActive.mockResolvedValueOnce(activeIdentity);

      const result = await ctx.service.login(user);

      expect(ctx.identities.findActive).toHaveBeenCalledWith('user-1');
      expect(result.activeIdentity).toEqual(activeIdentity);
    });

    it('falls back to the earliest-created identity and makes it the last used when none is active', async () => {
      const fallbackIdentity = buildIdentity({
        id: 'identity-3',
        isActive: false,
      });
      ctx.identities.findActive.mockResolvedValueOnce(null);
      ctx.identities.findEarliest.mockResolvedValueOnce(fallbackIdentity);

      const result = await ctx.service.login(user);

      expect(ctx.identities.markLastUsed).toHaveBeenCalledWith(
        'user-1',
        'identity-3',
      );
      expect(result.activeIdentity.isActive).toBe(true);
    });

    it("resumes the persona this device was using, ahead of the account's last used", async () => {
      const devicePersona = buildIdentity({
        id: 'identity-company',
        type: IdentityType.COMPANY,
        isActive: false,
      });
      ctx.identities.findForDevice.mockResolvedValueOnce(devicePersona);
      ctx.identities.listAll.mockResolvedValueOnce([
        buildIdentity(),
        devicePersona,
      ]);

      const result = await ctx.service.login(user, undefined, {
        deviceId: 'device-a',
      });

      expect(ctx.identities.findForDevice).toHaveBeenCalledWith(
        'user-1',
        'device-a',
      );
      expect(ctx.identities.findActive).not.toHaveBeenCalled();
      expect(ctx.sessions.upsertSession).toHaveBeenCalledWith(
        'user-1',
        { deviceId: 'device-a' },
        'identity-company',
      );
      expect(ctx.jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ ident: 'identity-company' }),
      );
      // isActive in the response means "active on this device"
      expect(result.identities.map((i) => [i.id, i.isActive])).toEqual([
        ['identity-1', false],
        ['identity-company', true],
      ]);
    });

    it('self-heals by provisioning a default individual identity when the user has none at all', async () => {
      // Registration always creates the User + its first Identity together
      // in one transaction, so this state should never happen -- but the
      // reported bug is exactly this: a User row with zero Identity rows,
      // permanently locking login out with "no identity associated" even
      // though signup correctly reports the phone/email as taken. Login
      // must recover instead of dead-ending.
      const healedIdentity = buildIdentity({
        id: 'identity-healed',
        isActive: true,
      });
      ctx.identities.findActive.mockResolvedValueOnce(null);
      ctx.identities.findEarliest.mockResolvedValueOnce(null);
      ctx.identities.createDefaultForOrphanedUser.mockResolvedValue(
        healedIdentity,
      );

      const result = await ctx.service.login(user);

      expect(ctx.identities.createDefaultForOrphanedUser).toHaveBeenCalledWith(
        'user-1',
      );
      expect(ctx.identities.markLastUsed).not.toHaveBeenCalled();
      expect(result.activeIdentity).toEqual(healedIdentity);
    });

    it('never self-heals for an explicit identityId that does not exist -- that is a real not-found error', async () => {
      ctx.identities.findById.mockResolvedValue(null);

      await expect(ctx.service.login(user, 'missing-identity')).rejects.toThrow(
        BadRequestException,
      );
      expect(
        ctx.identities.createDefaultForOrphanedUser,
      ).not.toHaveBeenCalled();
    });

    it('returns the signed access_token, user, activeIdentity, and full identities list', async () => {
      const identity = buildIdentity();
      const allIdentities = [identity];
      ctx.identities.findById.mockResolvedValue(identity);
      ctx.identities.listAll.mockResolvedValue(allIdentities);

      const result = await ctx.service.login(user, 'identity-1');

      expect(result).toEqual({
        access_token: 'mocked_token',
        sessionId: 'session-1',
        user: { ...user, accountStatus: 'active' },
        activeIdentity: identity,
        identities: allIdentities,
      });
    });
  });

  describe('switchIdentity', () => {
    const identity = {
      id: 'identity-2',
      userId: 'user-1',
      type: IdentityType.COMPANY,
      isActive: false,
      createdAt: new Date('2024-01-01'),
    };

    it('throws ForbiddenException when the identity does not belong to the user', async () => {
      ctx.identities.findById.mockResolvedValue(null);

      await expect(
        ctx.service.switchIdentity('user-1', 'identity-2'),
      ).rejects.toThrow(ForbiddenException);
      expect(ctx.identities.markLastUsed).not.toHaveBeenCalled();
    });

    it("switches this device only: marks the persona last used, stores it on this device's session, and returns a fresh JWT", async () => {
      ctx.identities.findById.mockResolvedValue(identity);
      ctx.prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@example.com',
        password: 'hashed',
      });
      ctx.identities.listAll.mockResolvedValue([
        { id: 'identity-1', isActive: true },
        { id: 'identity-2', isActive: false },
      ]);

      const result = await ctx.service.switchIdentity(
        'user-1',
        'identity-2',
        'session-a',
      );

      expect(ctx.identities.markLastUsed).toHaveBeenCalledWith(
        'user-1',
        'identity-2',
      );
      expect(ctx.sessions.setActiveIdentity).toHaveBeenCalledWith(
        'session-a',
        'identity-2',
      );
      expect(result.activeIdentity).toMatchObject({ isActive: true });
      expect(result.identities).toEqual([
        { id: 'identity-1', isActive: false },
        { id: 'identity-2', isActive: true },
      ]);
      expect(result.user).not.toHaveProperty('password');
      expect(ctx.jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        ident: 'identity-2',
        type: IdentityType.COMPANY,
        sid: 'session-a',
      });
    });

    it('throws UnauthorizedException if the user disappears before the post-switch refetch', async () => {
      ctx.identities.findById.mockResolvedValue(identity);
      ctx.prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        ctx.service.switchIdentity('user-1', 'identity-2'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
}
