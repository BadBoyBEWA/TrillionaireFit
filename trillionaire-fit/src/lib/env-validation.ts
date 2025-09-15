import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Required environment variables
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Optional environment variables with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Optional security variables
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
  
  // Optional admin variables
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_USERNAME: z.string().min(3).optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  SECRET_TOKEN: z.string().min(16).optional(),
  
  // Optional public variables
  NEXT_PUBLIC_SITE_NAME: z.string().default('Trillionaire Fit'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  
  // Email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
});

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return { success: true, env, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      return { success: false, env: null, errors };
    }
    return { 
      success: false, 
      env: null, 
      errors: [{ field: 'unknown', message: 'Unknown validation error', code: 'unknown' }] 
    };
  }
}

// Get validated environment variables
export function getValidatedEnv() {
  const result = validateEnv();
  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.errors.map(e => e.message).join(', ')}`);
  }
  return result.env;
}

// Check if we're in production
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// Check if we're in development
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// Check if we're in test
export function isTest() {
  return process.env.NODE_ENV === 'test';
}

// Generate secure secrets if not provided
export function generateSecureSecrets() {
  const crypto = require('crypto');
  
  return {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    CSRF_SECRET: crypto.randomBytes(32).toString('hex'),
  };
}

// Validate and log environment status
export function logEnvironmentStatus() {
  const result = validateEnv();
  
  if (result.success) {
    console.log('✅ Environment variables validated successfully');
    
    // Log warnings for missing optional variables
    const warnings = [];
    if (!process.env.CSRF_SECRET) {
      warnings.push('CSRF_SECRET not set - using default (not recommended for production)');
    }
    if (!process.env.ADMIN_EMAIL) {
      warnings.push('ADMIN_EMAIL not set - admin user creation will be skipped');
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Environment warnings:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  } else {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => {
      console.error(`  - ${error.field}: ${error.message}`);
    });
    
    if (isProduction()) {
      throw new Error('Environment validation failed in production');
    }
  }
  
  return result;
}

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>;
