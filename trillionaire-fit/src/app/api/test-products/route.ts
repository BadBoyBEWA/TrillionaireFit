import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 TEST - Starting direct MongoClient test');
    
    // Use the MongoClient connection directly (not Mongoose)
    const { client, db } = await connectToDatabase();
    console.log('✅ TEST - MongoClient connected successfully');
    
    // Get the products collection directly
    const productsCollection = db.collection('products');
    
    // Test basic operations
    const productCount = await productsCollection.countDocuments();
    console.log(`🔍 TEST - Total products in collection: ${productCount}`);
    
    // Fetch 5 products
    const products = await productsCollection
      .find({})
      .limit(5)
      .toArray();
    
    console.log(`🔍 TEST - Fetched ${products.length} products`);
    
    // Test if we can find products by specific criteria
    const activeProducts = await productsCollection
      .find({ isActive: true })
      .limit(3)
      .toArray();
    
    console.log(`🔍 TEST - Found ${activeProducts.length} active products`);
    
    // List all collections in the database
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`🔍 TEST - Available collections: ${collectionNames.join(', ')}`);
    
    return NextResponse.json({
      success: true,
      message: 'MongoClient test successful',
      data: {
        totalProducts: productCount,
        sampleProducts: products,
        activeProducts: activeProducts,
        collections: collectionNames,
        databaseName: db.databaseName,
        connectionInfo: {
          host: client.options.hosts?.[0]?.host || 'unknown',
          port: client.options.hosts?.[0]?.port || 'unknown',
        }
      }
    });
    
  } catch (error) {
    console.error('❌ TEST - MongoClient test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
