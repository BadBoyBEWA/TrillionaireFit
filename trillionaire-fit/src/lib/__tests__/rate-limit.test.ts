import { RateLimiter, createRateLimitResponse } from '../rate-limit';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockRequest: Request;

  beforeEach(() => {
    // Create a fresh rate limiter for each test
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxAttempts: 3,
    });

    // Mock request
    mockRequest = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    });
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.check(mockRequest);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = rateLimiter.check(mockRequest);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = rateLimiter.check(mockRequest);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
      // Make 3 requests (at the limit)
      rateLimiter.check(mockRequest);
      rateLimiter.check(mockRequest);
      rateLimiter.check(mockRequest);

      // 4th request should be blocked
      const result = rateLimiter.check(mockRequest);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      // Make requests up to limit
      rateLimiter.check(mockRequest);
      rateLimiter.check(mockRequest);
      rateLimiter.check(mockRequest);

      // Should be blocked
      let result = rateLimiter.check(mockRequest);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      result = rateLimiter.check(mockRequest);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should use custom key generator', () => {
      const customRateLimiter = new RateLimiter({
        windowMs: 1000,
        maxAttempts: 2,
        keyGenerator: (req) => 'custom-key',
      });

      const result1 = customRateLimiter.check(mockRequest);
      expect(result1.allowed).toBe(true);

      const result2 = customRateLimiter.check(mockRequest);
      expect(result2.allowed).toBe(true);

      const result3 = customRateLimiter.check(mockRequest);
      expect(result3.allowed).toBe(false);
    });
  });
});

describe('createRateLimitResponse', () => {
  it('should create proper rate limit response', () => {
    const remaining = 0;
    const resetTime = Date.now() + 60000;
    const message = 'Too many requests';

    const response = createRateLimitResponse(remaining, resetTime, message);

    expect(response.status).toBe(429);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Retry-After')).toBeTruthy();
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should calculate retry after correctly', () => {
    const remaining = 0;
    const resetTime = Date.now() + 5000; // 5 seconds from now

    const response = createRateLimitResponse(remaining, resetTime);

    const retryAfter = response.headers.get('Retry-After');
    expect(parseInt(retryAfter!)).toBeGreaterThan(0);
    expect(parseInt(retryAfter!)).toBeLessThanOrEqual(5);
  });
});
