import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { optimizeImage, validateImageFile, imagePresets } from '@/lib/image-optimization';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save original
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Optimize image and generate multiple sizes
    const optimizedResult = await optimizeImage(
      filepath,
      uploadsDir,
      filename,
      imagePresets.productGallery
    );

    return NextResponse.json({
      success: true,
      imageUrl: optimizedResult.original,
      imageUrls: optimizedResult.sizes,
      filename,
      size: buffer.length,
      optimized: true
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Handle multiple image uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadPromises = files.map(async (file) => {
      // Validate image file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${randomString}.${fileExtension}`;
      const filepath = join(uploadsDir, filename);

      // Convert file to buffer and save original
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Optimize image and generate multiple sizes
      const optimizedResult = await optimizeImage(
        filepath,
        uploadsDir,
        filename,
        imagePresets.productGallery
      );

      return {
        filename,
        imageUrl: optimizedResult.original,
        imageUrls: optimizedResult.sizes,
        size: buffer.length,
        optimized: true
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      images: results,
      count: results.length
    });

  } catch (error) {
    console.error('Multiple image upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    );
  }
}
