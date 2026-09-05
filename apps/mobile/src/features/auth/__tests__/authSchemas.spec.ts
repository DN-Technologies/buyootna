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

    it('documents a current asymmetry: a non-Kuwaiti numeric identifier passes login (loose numeric check) but fails signup (strict Kuwait check)', () => {
      const loginResult = loginSchema.safeParse({
        identifier: '12345678901',
        password: 'password123',
      });
      expect(loginResult.success).toBe(true);

      const signupResult = signupSchema.safeParse({
        name: 'Ali Salem',
        identifier: '12345678901',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(signupResult.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should fail when passwords do not match', () => {
      const result = signupSchema.safeParse({
        name: 'Ali Salem',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('should validate a valid email identifier', () => {
      const result = signupSchema.safeParse({
        name: 'Ali Salem',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('should validate a valid Kuwaiti phone identifier', () => {
      const result = signupSchema.safeParse({
        name: 'Ali Salem',
        identifier: '51234567',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('should fail on an identifier that is neither a valid email nor a valid Kuwaiti phone', () => {
      const result = signupSchema.safeParse({
        name: 'Ali Salem',
        identifier: 'not-a-valid-identifier',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is empty', () => {
      const result = signupSchema.safeParse({
        name: '',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is a single character', () => {
      const result = signupSchema.safeParse({
        name: 'A',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is only whitespace', () => {
      const result = signupSchema.safeParse({
        name: '    ',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should trim leading/trailing whitespace from a valid name', () => {
      const result = signupSchema.safeParse({
        name: '  Ali Salem  ',
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Ali Salem');
      }
    });

    it('should fail when name is longer than 32 characters', () => {
      const result = signupSchema.safeParse({
        name: 'a'.repeat(33),
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should accept a name that is exactly 32 characters', () => {
      const result = signupSchema.safeParse({
        name: 'a'.repeat(32),
        identifier: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
    });
  });
});
