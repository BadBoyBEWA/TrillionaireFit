import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validation schema for product data (excluding images)
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  designer: z.string().min(1, 'Designer is required').max(100, 'Designer name too long'),
  price: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, 'Price must be positive'),
  originalPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  gender: z.enum(['men', 'women', 'unisex']),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  subcategory: z.string().max(50, 'Subcategory too long').optional(),
  sizes: z.string().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  colors: z.string().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  materials: z.string().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  tags: z.string().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []).optional(),
  isActive: z.string().transform(val => val === 'true').default('true'),
  isFeatured: z.string().transform(val => val === 'true').default('false'),
  isOnSale: z.string().transform(val => val === 'true').default('false'),
  isPreowned: z.string().transform(val => val === 'true').default('false'),
  condition: z.enum(['excellent', 'very-good', 'good', 'fair']).optional(),
  totalStock: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Total stock must be positive').optional(),
  sku: z.string().max(50, 'SKU too long').optional(),
  weight: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  dimensions: z.string().optional(),
  careInstructions: z.string().max(500, 'Care instructions too long').optional(),
  shippingInfo: z.string().optional(),
  seo: z.string().optional()
});

// POST /api/products/with-images - Create product with images in single request
export async function POST(request: NextRequest) {
  const tempFilePaths: string[] = [];
  
  try {
    console.log('🔍 POST /api/products/with-images - Starting product creation with images');
    
    // Require admin authentication
    requireAdmin(request);
    console.log('✅ Admin authentication passed');
    
    await dbConnect();
    console.log('✅ Database connected');

    // Parse form data
    const formData = await request.formData();
    
    // Extract text fields
    const textData: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && key !== 'images') {
        textData[key] = value;
      }
    }

    console.log('📝 Text data extracted:', textData);

    // Validate text data
    const validatedData = productSchema.parse(textData);
    console.log('✅ Text data validated:', validatedData);

    // Handle images
    const imageFiles = formData.getAll('images') as File[];
    console.log(`📁 Found ${imageFiles.length} image files`);

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Validate all image files
    for (const file of imageFiles) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }
    }

    // Upload images to Cloudinary
    const uploadPromises = imageFiles.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const tempFileName = `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name}`;
      const tempFilePath = join(tmpdir(), tempFileName);
      
      // Save temporarily
      await writeFile(tempFilePath, Buffer.from(buffer));
      tempFilePaths.push(tempFilePath);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'trillionaire-fit/products',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true
      });
      
      return result;
    });

    const cloudinaryResults = await Promise.all(uploadPromises);
    console.log(`✅ ${cloudinaryResults.length} images uploaded to Cloudinary`);

    // Generate image URLs
    const imageUrls = cloudinaryResults.map(result => result.secure_url);

    // Parse complex fields
    let dimensions;
    if (validatedData.dimensions) {
      try {
        const dims = JSON.parse(validatedData.dimensions);
        dimensions = {
          length: dims.length || 0,
          width: dims.width || 0,
          height: dims.height || 0
        };
      } catch {
        dimensions = { length: 0, width: 0, height: 0 };
      }
    }

    let shippingInfo;
    if (validatedData.shippingInfo) {
      try {
        shippingInfo = JSON.parse(validatedData.shippingInfo);
      } catch {
        shippingInfo = { freeShipping: false, estimatedDays: 7 };
      }
    }

    let seo;
    if (validatedData.seo) {
      try {
        seo = JSON.parse(validatedData.seo);
      } catch {
        seo = { title: '', description: '', keywords: [] };
      }
    }

    // Create stock structure
    let stock: { [size: string]: { [color: string]: number } } = {};
    if (validatedData.sizes.length > 0 && validatedData.colors.length > 0) {
      const stockPerCombination = Math.floor((validatedData.totalStock || 0) / (validatedData.sizes.length * validatedData.colors.length));
      const remainingStock = (validatedData.totalStock || 0) % (validatedData.sizes.length * validatedData.colors.length);
      
      validatedData.sizes.forEach((size, sizeIndex) => {
        stock[size] = {};
        validatedData.colors.forEach((color, colorIndex) => {
          let stockForThisCombination = stockPerCombination;
          if (sizeIndex * validatedData.colors.length + colorIndex < remainingStock) {
            stockForThisCombination += 1;
          }
          stock[size][color] = stockForThisCombination;
        });
      });
    } else if (validatedData.totalStock && validatedData.totalStock > 0) {
      stock['Default'] = { 'Default': validatedData.totalStock };
    }

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

    // Create product
    const productData = {
      ...validatedData,
      images: imageUrls,
      stock,
      dimensions,
      shippingInfo,
      seo
    };

    console.log('🏗️ Creating product with data:', JSON.stringify(productData, null, 2));

    const product = new Product(productData);
    await product.save();
    console.log('✅ Product saved successfully');

    return NextResponse.json(
      { 
        message: 'Product created successfully',
        product: product.toObject()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Create product with images error:', error);
    
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
  } finally {
    // Clean up temporary files
    for (const tempFilePath of tempFilePaths) {
      try {
        await unlink(tempFilePath);
        console.log('🧹 Cleaned up temporary file:', tempFilePath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }
  }
}
