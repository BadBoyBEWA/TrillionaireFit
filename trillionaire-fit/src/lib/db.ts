import { MongoClient, Db } from 'mongodb';

interface DatabaseConfig {
  uri: string;
  dbName: string;
  options: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

// Get database configuration - always use MONGODB_URI for Atlas connection
const getDatabaseConfig = (): DatabaseConfig => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'trillionaire-fit';
  
  // Mask the URI for security in logs
  const maskedUri = mongoUri.replace(/\/\/.*@/, '//***:***@');
  console.log(`🔗 MongoDB URI: ${maskedUri}`);
  console.log(`📍 Database: ${dbName}`);

  return {
    uri: mongoUri,
    dbName,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    },
  };
};

// Global connection cache
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Database connection helper
export async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    console.log('✅ Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  const config = getDatabaseConfig();
  
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    const client = new MongoClient(config.uri, config.options);
    
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    const db = client.db(config.dbName);
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    
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
    const { client } = await connectDB();
    
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

// Database configuration getter
export const getDatabaseInfo = () => {
  const config = getDatabaseConfig();
  return {
    environment: process.env.NODE_ENV || 'development',
    database: config.dbName,
    isAtlas: true, // Always Atlas now
    uri: config.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
  };
};

// Mongoose-compatible dbConnect function for backward compatibility
export async function dbConnect() {
  try {
    // Import mongoose dynamically to avoid circular dependencies
    const mongoose = await import('mongoose');
    
    // Check if already connected
    if (mongoose.default.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB via Mongoose');
      return mongoose.default.connection;
    }
    
    // Get database configuration
    const config = getDatabaseConfig();
    
    // Connect using Mongoose with dbName option
    console.log('🔌 Connecting to MongoDB Atlas via Mongoose...');
    console.log(`🔍 DEBUG - Using URI: ${config.uri.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`🔍 DEBUG - Using database name: ${config.dbName}`);
    
    const connection = await mongoose.default.connect(config.uri, {
      dbName: config.dbName,
      maxPoolSize: config.options.maxPoolSize || 10,
      serverSelectionTimeoutMS: config.options.serverSelectionTimeoutMS || 30000,
      socketTimeoutMS: config.options.socketTimeoutMS || 45000,
      connectTimeoutMS: 30000,
      bufferCommands: false,
    });
    
    // Wait for the connection to be fully established
    await new Promise((resolve, reject) => {
      if (mongoose.default.connection.readyState === 1) {
        resolve(connection);
      } else {
        mongoose.default.connection.once('open', () => resolve(connection));
        mongoose.default.connection.once('error', reject);
      }
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas via Mongoose');
    console.log(`🔍 Connection state: ${mongoose.default.connection.readyState}`);
    console.log(`📊 Connection host: ${mongoose.default.connection.host}`);
    
    return connection;
  } catch (error) {
    console.error('❌ Mongoose connection failed:', error);
    throw error;
  }
}

// Export the main connection function as default
export default dbConnect;
