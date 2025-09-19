// CDN Integration utilities for image optimization and delivery
// This can be extended to integrate with services like Cloudinary, AWS CloudFront, etc.

export interface CDNConfig {
  baseUrl: string;
  apiKey?: string;
  secretKey?: string;
  cloudName?: string; // For Cloudinary
  bucketName?: string; // For AWS S3
  region?: string; // For AWS
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'pad';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

class CDNService {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  /**
   * Generate optimized image URL with transformations
   */
  generateImageUrl(imagePath: string, options: ImageTransformOptions = {}): string {
    const {
      width,
      height,
      quality = 85,
      format = 'auto',
      crop = 'fill',
      gravity = 'center',
      blur,
      brightness,
      contrast,
      saturation
    } = options;

    // For now, return the original path
    // In production, this would generate CDN URLs with transformations
    if (!this.config.baseUrl) {
      return imagePath;
    }

    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== 85) params.append('q', quality.toString());
    if (format !== 'auto') params.append('f', format);
    if (crop !== 'fill') params.append('c', crop);
    if (gravity !== 'center') params.append('g', gravity);
    if (blur) params.append('e_blur', blur.toString());
    if (brightness) params.append('e_brightness', brightness.toString());
    if (contrast) params.append('e_contrast', contrast.toString());
    if (saturation) params.append('e_saturation', saturation.toString());

    const queryString = params.toString();
    const separator = imagePath.includes('?') ? '&' : '?';
    
    return `${this.config.baseUrl}${imagePath}${queryString ? separator + queryString : ''}`;
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  generateResponsiveImageUrls(imagePath: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.generateImageUrl(imagePath, { width: 150, height: 150, crop: 'fill' }),
      small: this.generateImageUrl(imagePath, { width: 300, height: 300, crop: 'fit' }),
      medium: this.generateImageUrl(imagePath, { width: 600, height: 600, crop: 'fit' }),
      large: this.generateImageUrl(imagePath, { width: 1200, height: 1200, crop: 'fit' }),
      original: this.generateImageUrl(imagePath, { quality: 95 })
    };
  }

  /**
   * Upload image to CDN (placeholder for future implementation)
   */
  async uploadImage(file: File, folder?: string): Promise<string> {
    // This would integrate with your chosen CDN service
    // For now, return a placeholder
    throw new Error('CDN upload not implemented yet. Use local upload instead.');
  }

  /**
   * Delete image from CDN (placeholder for future implementation)
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    // This would delete the image from your CDN
    // For now, return true as placeholder
    console.log(`Would delete image: ${imagePath}`);
    return true;
  }
}

// Default CDN configuration (can be overridden with environment variables)
const defaultConfig: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || '',
  apiKey: process.env.CDN_API_KEY,
  secretKey: process.env.CDN_SECRET_KEY,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION
};

// Export singleton instance
export const cdnService = new CDNService(defaultConfig);

// Utility functions for common use cases
export const getOptimizedImageUrl = (imagePath: string, options?: ImageTransformOptions) => {
  return cdnService.generateImageUrl(imagePath, options);
};

export const getResponsiveImageUrls = (imagePath: string) => {
  return cdnService.generateResponsiveImageUrls(imagePath);
};

// Image optimization presets
export const imagePresets = {
  productThumbnail: (imagePath: string) => 
    cdnService.generateImageUrl(imagePath, { width: 200, height: 200, crop: 'fill', quality: 80 }),
  
  productGallery: (imagePath: string) => 
    cdnService.generateImageUrl(imagePath, { width: 600, height: 600, crop: 'fit', quality: 85 }),
  
  productHero: (imagePath: string) => 
    cdnService.generateImageUrl(imagePath, { width: 1200, height: 1200, crop: 'fit', quality: 90 }),
  
  avatar: (imagePath: string) => 
    cdnService.generateImageUrl(imagePath, { width: 100, height: 100, crop: 'fill', quality: 80 }),
  
  banner: (imagePath: string) => 
    cdnService.generateImageUrl(imagePath, { width: 1920, height: 600, crop: 'fill', quality: 85 })
};
