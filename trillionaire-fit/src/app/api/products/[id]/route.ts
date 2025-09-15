import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schema for updates
const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long').optional(),
  designer: z.string().min(1, 'Designer is required').max(100, 'Designer name too long').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  originalPrice: z.number().min(0, 'Original price must be positive').optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
  subcategory: z.string().max(50, 'Subcategory too long').optional(),
  sizes: z.array(z.string()).min(1, 'At least one size is required').optional(),
  colors: z.array(z.string()).min(1, 'At least one color is required').optional(),
  materials: z.array(z.string()).min(1, 'At least one material is required').optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
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

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Always calculate totalStock manually to ensure it's correct
    let totalStock = 0;
    if (product.stock) {
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
              totalStock += colorStock;
            }
          }
        }
      } else {
        // Plain object structure
        for (const sizeStock of Object.values(product.stock)) {
          for (const colorStock of Object.values(sizeStock)) {
            totalStock += colorStock;
          }
        }
      }
    }

    const productWithTotalStock = { 
      ...product.toObject(), 
      totalStock 
    };

    return NextResponse.json({ product: productWithTotalStock });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    requireAdmin(request);
    
    await connectDB();

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU already exists (if being updated)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ 
        sku: validatedData.sku, 
        _id: { $ne: params.id } 
      });
      if (skuExists) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Handle stock structure - prioritize stock over totalStock
    const { totalStock, stock, ...updateData } = validatedData;
    
    if (stock !== undefined) {
      // Use the provided stock structure
      updateData.stock = stock;
      console.log('📊 Using provided stock structure for update:', JSON.stringify(stock, null, 2));
    } else if (totalStock !== undefined) {
      // Convert totalStock to stock structure
      const stockStructure = {};
      if (totalStock > 0) {
        // Use existing sizes/colors or defaults
        const sizes = updateData.sizes || existingProduct.sizes || ['M'];
        const colors = updateData.colors || existingProduct.colors || ['Default'];
        const defaultSize = sizes[0];
        const defaultColor = colors[0];
        stockStructure[defaultSize] = { [defaultColor]: totalStock };
      }
      updateData.stock = stockStructure;
      console.log('📊 Created stock structure from totalStock for update:', JSON.stringify(stockStructure, null, 2));
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    requireAdmin(request);
    
    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
