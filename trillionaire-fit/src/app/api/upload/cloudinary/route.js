import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import cloudinary from '@/lib/cloudinary-config';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to upload buffer to Cloudinary
async function uploadBufferToCloudinary(buffer, folder = 'products') {
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
          console.error('❌ Cloudinary upload error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          console.log('✅ Cloudinary upload successful:', result.public_id);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

// POST /api/upload/cloudinary - Upload images to Cloudinary
export async function POST(request) {
  try {
    console.log('🔍 POST /api/upload/cloudinary - Starting image upload');
    
    // Parse form data
    const formData = await request.formData();
    
    // Get all files
    const files = formData.getAll('images');
    
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
    console.error('❌ Upload error:', error);
    
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
