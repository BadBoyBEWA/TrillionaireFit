import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  secure: true
});
// Cloudinary should auto-read CLOUDINARY_URL from process.env

// Helper function to upload buffer to Cloudinary using upload_stream
async function uploadBufferToCloudinary(buffer: Buffer, folder: string = 'uploads'): Promise<string> {
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

// POST /api/upload/cloudinary - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/upload/cloudinary - Starting file upload');
    
    const contentType = request.headers.get('content-type');
    let fileBuffer: Buffer;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }
      
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Handle base64 string upload
      const body = await request.json();
      const base64String = body.file;
      
      if (!base64String) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    }

    console.log('📁 Processing file upload');

    // Upload file to Cloudinary
    const secureUrl = await uploadBufferToCloudinary(fileBuffer, 'uploads');
    console.log('✅ File uploaded to Cloudinary');

    // Return the secure URL
    return NextResponse.json({
      secure_url: secureUrl
    });

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
