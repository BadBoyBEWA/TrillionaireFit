import {
  generateCSRFToken,
  generateCSRFTokenWithSecret,
  verifyCSRFToken,
  getCSRFTokenFromRequest,
} from '../csrf';

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token')
  })),
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-secret')
  })),
  timingSafeEqual: jest.fn(() => true)
}));

describe('CSRF Token Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCSRFToken', () => {
    it('should generate a random token', () => {
      const token = generateCSRFToken();
      expect(token).toBe('mock-token');
    });
  });

  describe('generateCSRFTokenWithSecret', () => {
    it('should generate token and secret pair', () => {
      const result = generateCSRFTokenWithSecret();
      
      expect(result).toEqual({
        token: 'mock-token',
        secret: 'mock-secret'
      });
    });
  });

  describe('verifyCSRFToken', () => {
    it('should verify valid token and secret', () => {
      const isValid = verifyCSRFToken('test-token', 'test-secret');
      expect(isValid).toBe(true);
    });

    it('should reject invalid token and secret', () => {
      const crypto = require('crypto');
      crypto.timingSafeEqual.mockReturnValue(false);
      
      const isValid = verifyCSRFToken('invalid-token', 'invalid-secret');
      expect(isValid).toBe(false);
    });
  });

  describe('getCSRFTokenFromRequest', () => {
    it('should extract token and secret from request headers', () => {
      const mockRequest = {
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('test-token')  // x-csrf-token
            .mockReturnValueOnce('test-secret') // x-csrf-secret
        }
      } as any;

      const result = getCSRFTokenFromRequest(mockRequest);
      
      expect(result).toEqual({
        token: 'test-token',
        secret: 'test-secret'
      });
    });

    it('should return null when headers are missing', () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any;

      const result = getCSRFTokenFromRequest(mockRequest);
      expect(result).toBeNull();
    });
  });
});