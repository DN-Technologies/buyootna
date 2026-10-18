import { UnauthorizedException } from '@nestjs/common';

jest.mock('apple-signin-auth', () => ({
  __esModule: true,
  default: { verifyIdToken: jest.fn() },
  verifyIdToken: jest.fn(),
}));

import appleSignin from 'apple-signin-auth';
import { AppleAuthService } from './apple-auth.service';

describe('AppleAuthService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('fails closed (throws) when APPLE_CLIENT_ID is not configured', async () => {
    delete process.env.APPLE_CLIENT_ID;
    const service = new AppleAuthService();

    await expect(service.verifyIdentityToken('some-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns the providerId and email from a verified token payload', async () => {
    process.env.APPLE_CLIENT_ID = 'com.example.app';
    (appleSignin.verifyIdToken as jest.Mock).mockResolvedValue({
      sub: 'apple-sub-123',
      email: 'user@example.com',
    });

    const service = new AppleAuthService();
    const result = await service.verifyIdentityToken('valid-token');

    expect(result).toEqual({
      providerId: 'apple-sub-123',
      email: 'user@example.com',
    });
    expect(appleSignin.verifyIdToken).toHaveBeenCalledWith('valid-token', {
      audience: ['com.example.app'],
    });
  });

  it('accepts tokens for every bundle ID listed in APPLE_CLIENT_ID', async () => {
    process.env.APPLE_CLIENT_ID = 'com.new.app, com.old.app';
    (appleSignin.verifyIdToken as jest.Mock).mockResolvedValue({
      sub: 'apple-sub-123',
      email: 'user@example.com',
    });

    await new AppleAuthService().verifyIdentityToken('valid-token');

    expect(appleSignin.verifyIdToken).toHaveBeenCalledWith('valid-token', {
      audience: ['com.new.app', 'com.old.app'],
    });
  });

  it('throws a clean UnauthorizedException when the underlying library rejects', async () => {
    process.env.APPLE_CLIENT_ID = 'com.example.app';
    (appleSignin.verifyIdToken as jest.Mock).mockRejectedValue(
      new Error('invalid signature'),
    );

    const service = new AppleAuthService();

    await expect(service.verifyIdentityToken('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
