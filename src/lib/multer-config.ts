import multer from 'multer';
import { NextRequest } from 'next/server';

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware to handle single file upload
export const uploadSingle = (fieldName: string = 'image') => {
  return upload.single(fieldName);
};

// Middleware to handle multiple file uploads
export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

// Helper to extract file from NextRequest (for API routes)
export async function getFileFromRequest(request: NextRequest, fieldName: string = 'image'): Promise<File | null> {
  try {
    const formData = await request.formData();
    const file = formData.get(fieldName) as File;
    return file || null;
  } catch (error) {
    console.error('Error extracting file from request:', error);
    return null;
  }
}

// Helper to extract multiple files from NextRequest
export async function getFilesFromRequest(request: NextRequest, fieldName: string = 'images'): Promise<File[]> {
  try {
    const formData = await request.formData();
    const files = formData.getAll(fieldName) as File[];
    return files.filter(file => file instanceof File);
  } catch (error) {
    console.error('Error extracting files from request:', error);
    return [];
  }
}

// Helper to convert File to Buffer
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper to validate file
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: 'File cannot be empty' };
  }

  return { valid: true };
}
