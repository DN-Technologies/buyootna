import { loginSchema, signupSchema } from '../authSchemas';

describe('Auth Schemas Validation Unit Tests', () => {
  describe('loginSchema', () => {
    it('should validate valid email and password', () => {
      const result = loginSchema.safeParse({
        identifier: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should validate valid phone number and password', () => {
      const result = loginSchema.safeParse({
        identifier: '+96551234567',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when password is less than 6 characters', () => {
      const result = loginSchema.safeParse({
        identifier: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should fail when passwords do not match', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        phone: '51234567',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
    });
  });
});
