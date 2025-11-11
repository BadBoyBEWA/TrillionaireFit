import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Wishlist } from '@/models/Wishlist';
import { Product } from '@/models/Product';
import { requireAuth } from '@/lib/auth-helpers';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: user.userId })
      .populate('products', 'name designer price images isActive isOnSale')
      .lean();

    if (!wishlist) {
      return NextResponse.json({
        products: [],
        productCount: 0
      });
    }

    // Filter out inactive products
    const activeProducts = wishlist.products.filter((product: any) => product.isActive);

    return NextResponse.json({
      products: activeProducts,
      productCount: activeProducts.length
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: user.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: user.userId,
        products: [productId]
      });
    } else {
      // Check if product is already in wishlist
      if (wishlist.products.includes(productId)) {
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 400 }
        );
      }
      
      wishlist.products.push(productId);
    }

    await wishlist.save();

    return NextResponse.json({
      message: 'Product added to wishlist',
      productCount: wishlist.products.length
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add product to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ user: user.userId });
    
    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (id: any) => id.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json({
      message: 'Product removed from wishlist',
      productCount: wishlist.products.length
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove product from wishlist' },
      { status: 500 }
    );
  }
}


