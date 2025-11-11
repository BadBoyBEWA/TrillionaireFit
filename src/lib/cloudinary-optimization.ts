import { generateCloudinaryUrls } from './cloudinary';

export interface CloudinaryImageUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

/**
 * Generate optimized image URLs for different sizes using Cloudinary
 */
export function getOptimizedImageUrls(publicId: string): CloudinaryImageUrls {
  return generateCloudinaryUrls(publicId);
}

/**
 * Generate responsive image srcset for Cloudinary images
 */
export function generateCloudinarySrcSet(publicId: string, sizes: number[]): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return sizes
    .map(size => `${baseUrl}/w_${size},c_fit,q_auto,f_auto/${publicId} ${size}w`)
    .join(', ');
}

/**
 * Generate responsive image sizes attribute
 */
export function generateSizesAttribute(breakpoints: { [key: string]: string }): string {
  return Object.entries(breakpoints)
    .map(([condition, size]) => `(${condition}) ${size}`)
    .join(', ');
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  
  const regex = new RegExp(`https://res\\.cloudinary\\.com/${cloudName}/image/upload/(?:[^/]+/)*([^.]+)`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  
  return url.includes(`res.cloudinary.com/${cloudName}/image/upload`);
}

/**
 * Image optimization presets for different use cases
 */
export const cloudinaryPresets = {
  productGallery: (publicId: string) => 
    getOptimizedImageUrls(publicId).medium,
  
  productThumbnail: (publicId: string) => 
    getOptimizedImageUrls(publicId).thumbnail,
  
  productHero: (publicId: string) => 
    getOptimizedImageUrls(publicId).large,
  
  avatar: (publicId: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${publicId}`;
  },
  
  banner: (publicId: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is not configured');
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,h_600,c_fill,q_auto,f_auto/${publicId}`;
  }
};

/**
 * Generate responsive image URLs for a Cloudinary image
 */
export function getResponsiveImageUrls(publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return getOptimizedImageUrls(publicId);
}
