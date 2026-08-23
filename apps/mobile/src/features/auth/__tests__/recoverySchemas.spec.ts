import {
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '../recoverySchemas';

describe('Recovery Schemas Validation Unit Tests', () => {
  describe('requestOtpSchema', () => {
    it('fails when identifier is empty', () => {
      const result = requestOtpSchema.safeParse({ identifier: '' });
      expect(result.success).toBe(false);
    });

    it('passes with a non-empty identifier', () => {
      const result = requestOtpSchema.safeParse({
        identifier: 'ali@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('verifyOtpSchema', () => {
    it('fails when otp is not exactly 6 characters', () => {
      expect(verifyOtpSchema.safeParse({ otp: '12345' }).success).toBe(false);
      expect(verifyOtpSchema.safeParse({ otp: '1234567' }).success).toBe(
        false,
      );
    });

    it('passes with a 6-digit otp', () => {
      expect(verifyOtpSchema.safeParse({ otp: '123456' }).success).toBe(true);
    });

    it('documents a current gap: length(6) does not restrict to digits, so 6 letters also pass', () => {
      expect(verifyOtpSchema.safeParse({ otp: 'abcdef' }).success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('fails when password is shorter than 8 characters', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'short1',
        confirmPassword: 'short1',
      });
      expect(result.success).toBe(false);
    });

    it('fails when password and confirmPassword do not match, with the error on confirmPassword', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'Password123',
        confirmPassword: 'Different123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['confirmPassword']);
      }
    });

    it('passes when password and confirmPassword match and meet the length requirement', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'Password123',
        confirmPassword: 'Password123',
      });
      expect(result.success).toBe(true);
    });
  });
});
