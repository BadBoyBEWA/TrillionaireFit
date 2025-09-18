# Database Migration Guide

This guide shows you how to migrate from the old `connectDB` function to the new `dbConnect` function with environment-based database switching.

## Quick Migration

### Before (Old Way)
```typescript
import connectDB from '@/lib/mongodb';

export async function GET() {
  await connectDB();
  // your db logic...
}
```

### After (New Way)
```typescript
import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();
  // your db logic...
}
```

## Step-by-Step Migration

### 1. Update Import Statement
```typescript
// Change this:
import connectDB from '@/lib/mongodb';

// To this:
import dbConnect from '@/lib/db';
```

### 2. Update Function Calls
```typescript
// Change this:
await connectDB();

// To this:
await dbConnect();
```

### 3. That's It!
The new `dbConnect` function is fully compatible with your existing code and provides:
- ✅ Automatic environment detection
- ✅ Better error handling
- ✅ Enhanced logging
- ✅ Connection pooling optimization

## Files to Update

Here are the API routes that need to be updated:

### API Routes
- [ ] `src/app/api/products/route.ts` ✅ (Already updated)
- [ ] `src/app/api/products/[id]/route.ts`
- [ ] `src/app/api/orders/route.ts`
- [ ] `src/app/api/orders/[id]/route.ts`
- [ ] `src/app/api/users/route.ts`
- [ ] `src/app/api/users/login/route.ts`
- [ ] `src/app/api/users/register/route.ts`
- [ ] `src/app/api/users/profile/route.ts`
- [ ] `src/app/api/users/addresses/route.ts`
- [ ] `src/app/api/admin/orders/route.ts`
- [ ] `src/app/api/admin/orders/[id]/route.ts`
- [ ] `src/app/api/admin/orders/verify-payment/route.ts`
- [ ] `src/app/api/payments/paystack/initialize/route.ts`
- [ ] `src/app/api/payments/paystack/verify/route.ts`
- [ ] `src/app/api/payments/paystack/manual-verify/route.ts`

### Server Components
- [ ] Any server components that use `connectDB`

## Benefits of Migration

### 1. Environment-Based Switching
```typescript
// Automatically uses:
// - Local MongoDB in development
// - Atlas in production
// - Override with MONGODB_ATLAS=true
```

### 2. Better Error Handling
```typescript
try {
  await dbConnect();
  // your logic...
} catch (error) {
  // Enhanced error messages with environment info
  console.error('Database error:', error);
}
```

### 3. Enhanced Logging
```
🔌 Connecting to Atlas MongoDB via Mongoose...
📍 Database: trillionaire-fit
✅ Successfully connected to Atlas MongoDB via Mongoose
```

### 4. Health Monitoring
```typescript
import { checkDatabaseHealth } from '@/lib/db';

const health = await checkDatabaseHealth();
console.log(health.status); // 'healthy' or 'unhealthy'
```

## Testing the Migration

### 1. Test Local Database
```bash
npm run db:local
npm run dev
# Check: http://localhost:3000/api/health
```

### 2. Test Atlas Database
```bash
npm run db:atlas
npm run dev
# Check: http://localhost:3000/api/health
```

### 3. Check Database Status
```bash
npm run db:status
```

## Rollback Plan

If you need to rollback, simply change the import back:
```typescript
// Rollback to old way:
import connectDB from '@/lib/mongodb';
await connectDB();
```

The old `mongodb.ts` file is still available and functional.

## Need Help?

- Check the health endpoint: `GET /api/health`
- View database status: `npm run db:status`
- Switch databases: `npm run db:local` or `npm run db:atlas`
- Check logs for connection details
