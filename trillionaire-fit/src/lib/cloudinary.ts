import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  quality?: number | 'auto';
  format?: string;
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const {
      folder = 'trillionaire-fit/products',
      public_id,
      transformation,
      resource_type = 'image'
    } = options;

    const uploadOptions: any = {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true,
      ...(public_id && { public_id }),
      ...(transformation && { transformation })
    };

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error('No result from Cloudinary upload'));
          }
        }
      ).end(buffer);
    });

    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  buffers: Buffer[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  try {
    const uploadPromises = buffers.map(buffer => uploadToCloudinary(buffer, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Failed to upload images to Cloudinary');
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Generate optimized image URLs for different sizes
 */
export function generateCloudinaryUrls(publicId: string, baseUrl?: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
  }

  const base = baseUrl || `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return {
    thumbnail: `${base}/w_150,h_150,c_fill,q_auto,f_auto/${publicId}`,
    small: `${base}/w_300,h_300,c_fit,q_auto,f_auto/${publicId}`,
    medium: `${base}/w_600,h_600,c_fit,q_auto,f_auto/${publicId}`,
    large: `${base}/w_1200,h_1200,c_fit,q_auto,f_auto/${publicId}`,
    original: `${base}/q_auto,f_auto/${publicId}`
  };
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  
  const regex = new RegExp(`https://res\\.cloudinary\\.com/${cloudName}/image/upload/(?:[^/]+/)*([^.]+)`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default cloudinary;
