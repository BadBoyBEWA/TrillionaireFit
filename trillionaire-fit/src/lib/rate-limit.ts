interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }
    
    // Default: use IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `rate_limit:${ip}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  check(request: Request): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const key = this.getKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      rateLimitStore.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: entry.resetTime
      };
    }
    
    if (entry.count >= this.config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.count,
      resetTime: entry.resetTime
    };
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per 15 minutes
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 requests per minute
});

export function createRateLimitResponse(
  remaining: number, 
  resetTime: number, 
  message: string = 'Too many requests'
) {
  const resetDate = new Date(resetTime);
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({ 
      error: message,
      retryAfter: retryAfter,
      resetTime: resetDate.toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
      },
    }
  );
}
