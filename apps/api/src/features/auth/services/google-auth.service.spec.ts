import { UnauthorizedException } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

interface GoogleAuthServiceWithMockClient {
  client: { verifyIdToken: jest.Mock };
}

function mockClientOf(service: GoogleAuthService) {
  return (service as unknown as GoogleAuthServiceWithMockClient).client;
}

describe('GoogleAuthService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('fails closed (throws) when GOOGLE_CLIENT_ID is not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const service = new GoogleAuthService();

    await expect(service.verifyIdToken('some-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns the providerId and email from a verified token payload', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    const service = new GoogleAuthService();

    const mockGetPayload = jest.fn().mockReturnValue({
      sub: 'google-sub-123',
      email: 'user@example.com',
    });
    mockClientOf(service).verifyIdToken = jest
      .fn()
      .mockResolvedValue({ getPayload: mockGetPayload });

    const result = await service.verifyIdToken('valid-token');

    expect(result).toEqual({
      providerId: 'google-sub-123',
      email: 'user@example.com',
    });
  });

  it('throws when the verified token has no payload/sub', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    const service = new GoogleAuthService();

    mockClientOf(service).verifyIdToken = jest
      .fn()
      .mockResolvedValue({ getPayload: () => undefined });

    await expect(service.verifyIdToken('valid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws a clean UnauthorizedException when the underlying library rejects', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    const service = new GoogleAuthService();

    mockClientOf(service).verifyIdToken = jest
      .fn()
      .mockRejectedValue(new Error('invalid signature'));

    await expect(service.verifyIdToken('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
