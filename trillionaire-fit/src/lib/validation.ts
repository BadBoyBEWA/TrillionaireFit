import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password cannot exceed 15 characters'),
  role: z.enum(['buyer', 'admin']).optional().default('buyer')
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Query parameters schema
export const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').default('10'),
  role: z.enum(['buyer', 'admin']).optional()
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('ZodError properties:', Object.keys(error));
      console.log('error.errors:', error.errors);
      console.log('error.issues:', error.issues);
      
      // Try different property names for different Zod versions
      let messages = 'Invalid input';
      
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        messages = error.errors.map(e => e.message).join(', ');
      } else if (error.issues && Array.isArray(error.issues) && error.issues.length > 0) {
        messages = error.issues.map(e => e.message).join(', ');
      }
      
      throw new Error(messages);
    }
    console.error("Zod validation failed:", error);
    throw new Error('An unknown error occurred during validation');
  }
}

