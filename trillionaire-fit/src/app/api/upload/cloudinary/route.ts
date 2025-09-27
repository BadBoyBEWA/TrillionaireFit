import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to Cloudinary using upload_stream
async function uploadBufferToCloudinary(buffer: Buffer, folder: string = 'products'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trillionaire-fit/${folder}`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          console.log('Cloudinary upload successful:', result.public_id);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

// POST /api/upload/cloudinary - Upload single or multiple images to Cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/upload/cloudinary - Starting image upload');
    
    // Parse form data
    const formData = await request.formData();
    
    // Get all files (support both single and multiple uploads)
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    console.log(`📁 Processing ${files.length} files`);

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const secureUrl = await uploadBufferToCloudinary(buffer, 'products');
      return secureUrl;
    });

    const urls = await Promise.all(uploadPromises);
    console.log(`✅ ${urls.length} images uploaded to Cloudinary`);

    // Return URLs in the requested format
    if (urls.length === 1) {
      return NextResponse.json({
        success: true,
        url: urls[0]
      });
    } else {
      return NextResponse.json({
        success: true,
        urls: urls
      });
    }

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// PUT /api/upload/cloudinary - Upload multiple images to Cloudinary (legacy endpoint)
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/upload/cloudinary - Starting multiple image upload');
    
    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    console.log(`📁 Processing ${files.length} files`);

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const secureUrl = await uploadBufferToCloudinary(buffer, 'products');
      return secureUrl;
    });

    const urls = await Promise.all(uploadPromises);
    console.log(`✅ ${urls.length} images uploaded to Cloudinary`);

    return NextResponse.json({
      success: true,
      urls: urls
    });

  } catch (error) {
    console.error('❌ Multiple Cloudinary upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
