import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  designer: z.string().min(1, 'Designer is required').max(100, 'Designer name too long'),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().min(0, 'Original price must be positive').optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  gender: z.enum(['men', 'women', 'unisex']),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  subcategory: z.string().max(50, 'Subcategory too long').optional(),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  colors: z.array(z.string()).min(1, 'At least one color is required'),
  materials: z.array(z.string()).min(1, 'At least one material is required'),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isPreowned: z.boolean().default(false),
  condition: z.enum(['excellent', 'very-good', 'good', 'fair']).optional(),
  totalStock: z.number().min(0, 'Total stock must be positive').optional(),
  stock: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long').optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Length must be positive'),
    width: z.number().min(0, 'Width must be positive'),
    height: z.number().min(0, 'Height must be positive')
  }).optional(),
  careInstructions: z.string().max(500, 'Care instructions too long').optional(),
  shippingInfo: z.object({
    freeShipping: z.boolean().default(false),
    estimatedDays: z.number().min(1, 'Must be at least 1 day').max(30, 'Cannot exceed 30 days')
  }).optional(),
  seo: z.object({
    title: z.string().max(60, 'SEO title too long').optional(),
    description: z.string().max(160, 'SEO description too long').optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isOnSale: z.coerce.boolean().optional(),
  preowned: z.coerce.boolean().optional(),
  condition: z.enum(['excellent', 'very-good', 'good', 'fair']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'popularity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/products - Starting product fetch');
    
    // Connect to database with timeout handling
    await dbConnect();
    console.log('✅ Database connected for GET');

    // DEBUG: Add comprehensive debugging information
    const mongoose = await import('mongoose');
    console.log('🔍 DEBUG - Mongoose connection state:', mongoose.default.connection.readyState);
    console.log('🔍 DEBUG - Mongoose connection host:', mongoose.default.connection.host);
    console.log('🔍 DEBUG - Mongoose connection name:', mongoose.default.connection.name);
    console.log('🔍 DEBUG - Mongoose model names:', mongoose.default.modelNames());
    console.log('🔍 DEBUG - Product model collection name:', Product.collection.name);
    console.log('🔍 DEBUG - Product model collection db name:', Product.collection.dbName);
    
    // Ensure connection is fully established before proceeding
    if (mongoose.default.connection.readyState !== 1) {
      console.log('⚠️ WARNING - Connection not fully established, waiting...');
      await new Promise((resolve, reject) => {
        if (mongoose.default.connection.readyState === 1) {
          resolve(true);
        } else {
          mongoose.default.connection.once('open', () => resolve(true));
          mongoose.default.connection.once('error', reject);
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Connection timeout')), 10000);
        }
      });
      console.log('✅ Connection fully established');
    }
    
    // Check if products collection exists and has documents
    try {
      const productCount = await Product.countDocuments();
      console.log('🔍 DEBUG - Total products in collection:', productCount);
      
      if (productCount === 0) {
        console.log('⚠️ WARNING - Products collection is empty!');
        // List all collections in the database
        if (mongoose.default.connection.db) {
          const collections = await mongoose.default.connection.db.listCollections().toArray();
          console.log('🔍 DEBUG - Available collections:', collections.map(c => c.name));
        } else {
          console.log('🔍 DEBUG - No database connection available for listing collections');
        }
      }
    } catch (countError) {
      console.error('❌ DEBUG - Error counting products:', countError);
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    console.log('📋 Raw query parameters:', queryParams);
    const validatedQuery = querySchema.parse(queryParams);
    console.log('✅ Validated query:', JSON.stringify(validatedQuery, null, 2));

    const {
      page,
      limit,
      gender,
      category,
      search,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      isOnSale,
      preowned,
      condition,
      sortBy,
      sortOrder
    } = validatedQuery;

    // Build filter object
    const filter: any = {};
    
    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (isOnSale !== undefined) filter.isOnSale = isOnSale;
    if (preowned !== undefined) filter.isPreowned = preowned;
    if (condition) filter.condition = condition;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (search) {
      // Use regex search for more flexible matching across multiple fields
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { designer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    if (sortBy === 'popularity') {
      // For now, sort by createdAt. In future, implement actual popularity tracking
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Debug logging removed - stock display is now working

    // Ensure totalStock is calculated for each product
    const productsWithTotalStock = products.map(product => {
      if (product.totalStock === undefined && product.stock) {
        let totalStock = 0;
        // Handle both Mongoose Map and plain object structures
        if (product.stock.values && typeof product.stock.values === 'function') {
          // Mongoose Map structure
          for (const sizeStock of product.stock.values()) {
            if (sizeStock.values && typeof sizeStock.values === 'function') {
              for (const colorStock of sizeStock.values()) {
                totalStock += colorStock;
              }
            } else {
              // Plain object structure
              for (const colorStock of Object.values(sizeStock)) {
                totalStock += Number(colorStock) || 0;
              }
            }
          }
        } else {
          // Plain object structure
          for (const sizeStock of Object.values(product.stock)) {
            for (const colorStock of Object.values(sizeStock as any)) {
              totalStock += Number(colorStock) || 0;
            }
          }
        }
        return { ...product, totalStock };
      }
      return product;
    });

    return NextResponse.json({
      products: productsWithTotalStock,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/products - Starting product creation');
    
    // Require admin authentication
    requireAdmin(request);
    console.log('✅ Admin authentication passed');
    
    await dbConnect();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    
    const validatedData = productSchema.parse(body);
    console.log('✅ Data validation passed:', JSON.stringify(validatedData, null, 2));

    // Check if SKU already exists
    if (validatedData.sku) {
      const existingProduct = await Product.findOne({ sku: validatedData.sku });
      if (existingProduct) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Handle stock structure - prioritize stock over totalStock
    const { totalStock, stock, ...productData } = validatedData;
    console.log('🔄 Stock data received:', { totalStock, stock });
    console.log('📦 Product data after extraction:', JSON.stringify(productData, null, 2));
    
    let finalStock: { [size: string]: { [color: string]: number } } = {};
    
    if (stock && Object.keys(stock).length > 0) {
      // Use the provided stock structure
      finalStock = stock;
      console.log('📊 Using provided stock structure:', JSON.stringify(finalStock, null, 2));
    } else if (totalStock && totalStock > 0) {
      // Convert totalStock to stock structure
      const defaultSize = productData.sizes[0] || 'M';
      const defaultColor = productData.colors[0] || 'Default';
      finalStock[defaultSize] = { [defaultColor]: totalStock };
      console.log('📊 Created stock structure from totalStock:', JSON.stringify(finalStock, null, 2));
    } else {
      console.log('⚠️ No stock or totalStock provided');
    }

    // Create product with stock structure
    const productDataWithStock = {
      ...productData,
      stock: finalStock
    };
    console.log('🏗️ Final product data for creation:', JSON.stringify(productDataWithStock, null, 2));
    
    const product = new Product(productDataWithStock);
    console.log('📝 Product instance created, saving...');
    
    await product.save();
    console.log('✅ Product saved successfully');
    
    const savedProduct = product.toObject();
    console.log('💾 Saved product data:', JSON.stringify(savedProduct, null, 2));
    console.log('📊 Virtual totalStock:', product.totalStock);

    return NextResponse.json(
      { 
        message: 'Product created successfully',
        product: product.toObject()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
