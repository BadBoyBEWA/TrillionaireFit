import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
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

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `upload-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
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

// Helper function to handle multer upload
const uploadMiddleware = (fieldName: string, maxCount: number = 1) => {
  return (req: any, res: any) => {
    return new Promise((resolve, reject) => {
      const uploadHandler = maxCount === 1 
        ? upload.single(fieldName)
        : upload.array(fieldName, maxCount);
      
      uploadHandler(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(req);
        }
      });
    });
  };
};

// Helper function to upload file to Cloudinary
async function uploadFileToCloudinary(filePath: string, folder: string = 'products') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `trillionaire-fit/${folder}`,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

// Helper function to generate optimized URLs
function generateOptimizedUrls(publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return {
    thumbnail: `${baseUrl}/w_150,h_150,c_fill,f_auto,q_auto/${publicId}`,
    small: `${baseUrl}/w_300,h_300,c_fit,f_auto,q_auto/${publicId}`,
    medium: `${baseUrl}/w_600,h_600,c_fit,f_auto,q_auto/${publicId}`,
    large: `${baseUrl}/w_1200,h_1200,c_fit,f_auto,q_auto/${publicId}`,
    original: `${baseUrl}/f_auto,q_auto/${publicId}`
  };
}

// POST /api/upload/cloudinary - Upload single image to Cloudinary
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    console.log('🔍 POST /api/upload/cloudinary - Starting single image upload');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Save file temporarily
    const buffer = await file.arrayBuffer();
    const tempFileName = `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name}`;
    tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, Buffer.from(buffer));

    console.log('📁 File saved temporarily:', tempFilePath);

    // Upload to Cloudinary
    const result = await uploadFileToCloudinary(tempFilePath, 'products');
    console.log('✅ Image uploaded to Cloudinary:', result.public_id);

    // Generate optimized URLs
    const optimizedUrls = generateOptimizedUrls(result.public_id);

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
      urls: optimizedUrls,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
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
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('🧹 Cleaned up temporary file:', tempFilePath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }
  }
}

// PUT /api/upload/cloudinary - Upload multiple images to Cloudinary
export async function PUT(request: NextRequest) {
  const tempFilePaths: string[] = [];
  
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

    // Save files temporarily and upload to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const tempFileName = `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name}`;
      const tempFilePath = join(tmpdir(), tempFileName);
      
      // Save temporarily
      await writeFile(tempFilePath, Buffer.from(buffer));
      tempFilePaths.push(tempFilePath);
      
      // Upload to Cloudinary
      const result = await uploadFileToCloudinary(tempFilePath, 'products');
      
      // Generate optimized URLs
      const optimizedUrls = generateOptimizedUrls(result.public_id);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        urls: optimizedUrls,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at
      };
    });

    const results = await Promise.all(uploadPromises);
    console.log(`✅ ${results.length} images uploaded to Cloudinary`);

    return NextResponse.json({
      success: true,
      images: results,
      count: results.length
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
