import { logEnvironmentStatus, generateSecureSecrets, isProduction } from './env-validation';
import { connectDB } from './mongodb';

export async function validateStartup() {
  console.log('🚀 Starting application validation...');
  
  try {
    // 1. Validate environment variables
    console.log('📋 Validating environment variables...');
    const envResult = logEnvironmentStatus();
    
    if (!envResult.success) {
      throw new Error('Environment validation failed');
    }
    
    // 2. Test database connection
    console.log('🗄️ Testing database connection...');
    try {
      await connectDB();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error('Database connection failed');
    }
    
    // 3. Validate security configuration
    console.log('🔒 Validating security configuration...');
    validateSecurityConfig();
    
    // 4. Log startup completion
    console.log('✅ Application startup validation completed successfully');
    
    return { success: true, message: 'Application started successfully' };
    
  } catch (error) {
    console.error('❌ Application startup validation failed:', error);
    
    if (isProduction()) {
      // In production, exit the process if validation fails
      process.exit(1);
    } else {
      // In development, log warnings but continue
      console.warn('⚠️ Continuing in development mode despite validation errors');
    }
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown startup error' 
    };
  }
}

function validateSecurityConfig() {
  const warnings = [];
  const errors = [];
  
  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET is too short (minimum 32 characters)');
  }
  
  // Check CSRF secret
  const csrfSecret = process.env.CSRF_SECRET;
  if (!csrfSecret) {
    warnings.push('CSRF_SECRET not set - using default (not recommended for production)');
  } else if (csrfSecret.length < 32) {
    errors.push('CSRF_SECRET is too short (minimum 32 characters)');
  }
  
  // Check MongoDB URI
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.includes('localhost') && isProduction()) {
    warnings.push('Using localhost MongoDB in production is not recommended');
  }
  
  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️ Security warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Log errors
  if (errors.length > 0) {
    console.error('❌ Security errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Security configuration validation failed');
  }
  
  console.log('✅ Security configuration validated');
}
