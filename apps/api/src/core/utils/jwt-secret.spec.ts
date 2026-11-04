import { jwtSecret } from './jwt-secret';

describe('jwtSecret', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.JWT_SECRET;
  });
  afterAll(() => {
    process.env = env;
  });

  const LONG = 'a'.repeat(96);

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    // Production ran on a fixed fallback string from the repo (2026-11-04)
    it('refuses to run without JWT_SECRET', () => {
      expect(() => jwtSecret()).toThrow(/JWT_SECRET is not set/);
    });

    it('refuses an empty or blank JWT_SECRET', () => {
      process.env.JWT_SECRET = '   ';
      expect(() => jwtSecret()).toThrow(/JWT_SECRET is not set/);
    });

    it('refuses a short JWT_SECRET', () => {
      process.env.JWT_SECRET = 'short-secret';
      expect(() => jwtSecret()).toThrow(/too short/);
    });

    it("returns the server's own secret", () => {
      process.env.JWT_SECRET = LONG;
      expect(jwtSecret()).toBe(LONG);
    });

    it('never returns the old fallback string', () => {
      expect(() => jwtSecret()).toThrow();
      process.env.JWT_SECRET = LONG;
      expect(jwtSecret()).not.toBe('super-secret-fallback-key');
    });
  });

  describe('outside production', () => {
    it('uses JWT_SECRET when set', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'local';
      expect(jwtSecret()).toBe('local');
    });

    it('falls back to a development-only value so start:dev and tests work', () => {
      process.env.NODE_ENV = 'test';
      expect(jwtSecret()).toBe('local-development-only-jwt-secret');
    });
  });
});
