import { MongoClient, Db } from 'mongodb';

interface DatabaseConfig {
  uri: string;
  dbName: string;
  options: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    bufferMaxEntries?: number;
    bufferCommands?: boolean;
  };
}

// Environment-based database configuration
const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isAtlas = process.env.MONGODB_ATLAS === 'true';
  const useAtlas = isProduction || isAtlas;

  if (useAtlas) {
    // MongoDB Atlas configuration
    const atlasUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
    
    if (!atlasUri) {
      throw new Error('MONGODB_ATLAS_URI or MONGODB_URI environment variable is required for Atlas connection');
    }

    return {
      uri: atlasUri,
      dbName: process.env.MONGODB_DB_NAME || 'trillionaire-fit',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      },
    };
  } else {
    // Local MongoDB configuration
    const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017';
    
    return {
      uri: localUri,
      dbName: process.env.MONGODB_DB_NAME || 'trillionaire-fit',
      options: {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      },
    };
  }
};

// Global connection cache
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Database connection helper
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const config = getDatabaseConfig();
  
  try {
    console.log(`🔌 Connecting to ${process.env.NODE_ENV === 'production' ? 'Atlas' : 'Local'} MongoDB...`);
    console.log(`📍 Database: ${config.dbName}`);
    
    const client = new MongoClient(config.uri, config.options);
    
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    const db = client.db(config.dbName);
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log(`✅ Successfully connected to ${process.env.NODE_ENV === 'production' ? 'Atlas' : 'Local'} MongoDB`);
    
    return { client, db };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Graceful connection cleanup
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('🔌 Database connection closed');
  }
}

// Health check for database
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  database: string;
  environment: string;
}> {
  try {
    const { client } = await connectToDatabase();
    
    // Test basic operations
    await client.db('admin').command({ ping: 1 });
    
    return {
      status: 'healthy',
      message: 'Database connection is working properly',
      database: getDatabaseConfig().dbName,
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      database: getDatabaseConfig().dbName,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

// Environment detection helpers
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
export const isUsingAtlas = (): boolean => process.env.MONGODB_ATLAS === 'true' || isProduction();

// Database configuration getter
export const getDatabaseInfo = () => {
  const config = getDatabaseConfig();
  return {
    environment: process.env.NODE_ENV || 'development',
    database: config.dbName,
    isAtlas: isUsingAtlas(),
    uri: config.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
  };
};

// Mongoose-compatible dbConnect function for backward compatibility
export async function dbConnect() {
  try {
    // Import mongoose dynamically to avoid circular dependencies
    const mongoose = await import('mongoose');
    
    // Get database configuration
    const config = getDatabaseConfig();
    
    // Check if already connected
    if (mongoose.default.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB via Mongoose');
      return mongoose.default.connection;
    }
    
    // Connect using Mongoose
    console.log(`🔌 Connecting to ${isUsingAtlas() ? 'Atlas' : 'Local'} MongoDB via Mongoose...`);
    console.log(`📍 Database: ${config.dbName}`);
    
    const connection = await mongoose.default.connect(config.uri, {
      bufferCommands: false,
      maxPoolSize: config.options.maxPoolSize || 10,
      serverSelectionTimeoutMS: config.options.serverSelectionTimeoutMS || 5000,
      socketTimeoutMS: config.options.socketTimeoutMS || 45000,
    });
    
    console.log(`✅ Successfully connected to ${isUsingAtlas() ? 'Atlas' : 'Local'} MongoDB via Mongoose`);
    
    return connection;
  } catch (error) {
    console.error('❌ Mongoose connection failed:', error);
    throw error;
  }
}

// Export the main connection function as default
export default connectToDatabase;
