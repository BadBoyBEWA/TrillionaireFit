import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (auto-reads CLOUDINARY_URL)
cloudinary.config({ secure: true });

// Helper function to upload buffer to Cloudinary
async function uploadBufferToCloudinary(buffer: Buffer, folder: string = 'uploads'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trillionaire-fit/${folder}`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          console.log('✅ Cloudinary upload success:', result.public_id);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );
    uploadStream.end(buffer);
  });
}

// POST /api/upload/cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/upload/cloudinary - Starting file upload');

    const contentType = request.headers.get('content-type');
    let files: File[] = [];

    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Support both `file` and `images`
      const file = formData.get('file') as File | null;
      const images = formData.getAll('images') as File[];

      if (file) files.push(file);
      if (images && images.length > 0) files = [...files, ...images];

      console.log('📁 formData keys:', [...formData.keys()]);
      console.log(`📸 Received ${files.length} file(s)`);

      if (files.length === 0) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Validate files
      for (const f of files) {
        console.log('➡ Incoming file:', { name: f.name, type: f.type, size: f.size });
        if (!f.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }
        if (f.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
        }
      }

      // Upload all files
      const uploadPromises = files.map(async (f) => {
        const buffer = Buffer.from(await f.arrayBuffer());
        return uploadBufferToCloudinary(buffer, 'uploads');
      });

      const urls = await Promise.all(uploadPromises);
      console.log(`✅ Uploaded ${urls.length} image(s) to Cloudinary`);

      return NextResponse.json({ success: true, urls });
    } else {
      // Handle base64 upload
      const body = await request.json();
      const base64String = body.file;

      if (!base64String) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      console.log('📁 Received base64 string:', {
        length: base64String.length,
        preview: base64String.substring(0, 50) + '...',
      });

      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const secureUrl = await uploadBufferToCloudinary(buffer, 'uploads');

      return NextResponse.json({ success: true, urls: [secureUrl] });
    }
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
