
import { validateEnv, isProduction, isDevelopment, isTest } from '../env-validation';

// Mock process.env
const originalEnv = process.env;

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should validate required environment variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'a'.repeat(32);

      const result = validateEnv();

      expect(result.success).toBe(true);
      expect(result.env).toBeDefined();
      expect(result.env?.MONGODB_URI).toBe('mongodb://localhost:27017/test');
      expect(result.env?.JWT_SECRET).toBe('a'.repeat(32));
    });

    it('should fail when required variables are missing', () => {
      delete process.env.MONGODB_URI;
      delete process.env.JWT_SECRET;

      const result = validateEnv();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('MONGODB_URI');
      expect(result.errors[1].field).toBe('JWT_SECRET');
    });

    it('should fail when JWT_SECRET is too short', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'short';

      const result = validateEnv();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('JWT_SECRET');
      expect(result.errors[0].message).toContain('at least 32 characters');
    });

    it('should use default values for optional variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'a'.repeat(32);

      const result = validateEnv();

      expect(result.success).toBe(true);
      expect(result.env?.NODE_ENV).toBe('development');
      expect(result.env?.PORT).toBe(3000);
      expect(result.env?.NEXT_PUBLIC_SITE_NAME).toBe('Trillionaire Fit');
    });

    it('should validate NODE_ENV enum', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'invalid';

      const result = validateEnv();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('NODE_ENV');
    });
  });

  describe('Environment helpers', () => {
    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      expect(isTest()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(false);
    });
  });
});
