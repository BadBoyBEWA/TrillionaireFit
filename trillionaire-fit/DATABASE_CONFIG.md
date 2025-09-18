# Database Configuration Guide

This project now supports automatic switching between local MongoDB and MongoDB Atlas based on environment variables.

## Environment Variables


### For Local MongoDB (Development)
```env
MONGODB_LOCAL_URI=mongodb://localhost:27017
MONGODB_DB_NAME=trillionaire-fit
```

### For MongoDB Atlas (Production/Cloud)
```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_ATLAS=true
MONGODB_DB_NAME=trillionaire-fit
```

### Fallback (Backward Compatibility)
```env
MONGODB_URI=mongodb://localhost:27017/trillionaire-fit
```

## How It Works

1. **Development Mode**: Uses local MongoDB by default
2. **Production Mode**: Uses Atlas by default
3. **Manual Override**: Set `MONGODB_ATLAS=true` to force Atlas in development
4. **Priority Order**:
   - `MONGODB_ATLAS_URI` (if `MONGODB_ATLAS=true` or production)
   - `MONGODB_URI` (fallback)
   - `MONGODB_LOCAL_URI` (default for development)

## Recommended .env.local Setup

### Option 1: Local Development Only
```env
MONGODB_LOCAL_URI=mongodb://localhost:27017
MONGODB_DB_NAME=trillionaire-fit
```

### Option 2: Atlas Development
```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_ATLAS=true
MONGODB_DB_NAME=trillionaire-fit
```

### Option 3: Both (Switchable)
```env
# Local MongoDB
MONGODB_LOCAL_URI=mongodb://localhost:27017

# Atlas MongoDB
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Database name
MONGODB_DB_NAME=trillionaire-fit

# Force Atlas in development (optional)
# MONGODB_ATLAS=true
```

## Usage in Code

```typescript
import { connectToDatabase, isUsingAtlas, getDatabaseInfo } from '@/lib/db';

// Connect to database
const { client, db } = await connectToDatabase();

// Check current configuration
console.log('Using Atlas:', isUsingAtlas());
console.log('Database info:', getDatabaseInfo());
```

## Benefits

- ✅ Automatic environment detection
- ✅ Easy switching between local and Atlas
- ✅ Better error handling and logging
- ✅ Connection pooling optimization
- ✅ Health check functionality
- ✅ Backward compatibility
