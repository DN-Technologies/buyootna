import { createAuthTestContext } from './tests/auth-test.harness';
import { registerSocialAuthTests } from './tests/auth-social.suite';
import { registerCredentialsAuthTests } from './tests/auth-credentials.suite';
import { registerLoginAuthTests } from './tests/auth-login.suite';
import { registerOtpAuthTests } from './tests/auth-otp.suite';

describe('AuthService Unit Tests', () => {
  const ctx = createAuthTestContext();

  beforeEach(async () => {
    await ctx.setup();
  });

  it('should be defined', () => {
    expect(ctx.service).toBeDefined();
  });

  registerSocialAuthTests(ctx);
  registerCredentialsAuthTests(ctx);
  registerLoginAuthTests(ctx);
  registerOtpAuthTests(ctx);
});
