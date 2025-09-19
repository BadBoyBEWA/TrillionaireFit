import sharp from 'sharp';
import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';
  progressive?: boolean;
  mozjpeg?: boolean;
}

export interface OptimizedImageResult {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  sizes: {
    [key: string]: string;
  };
}

/**
 * Optimize a single image and generate multiple sizes
 */
export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  filename: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    quality = 85,
    format = 'jpeg',
    fit = 'inside',
    position = 'center',
    progressive = true,
    mozjpeg = true
  } = options;

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  // Generate different sizes
  const sizes = {
    thumbnail: { width: 150, height: 150, fit: 'cover' as const },
    small: { width: 300, height: 300, fit },
    medium: { width: 600, height: 600, fit },
    large: { width: 1200, height: 1200, fit }
  };

  const results: { [key: string]: string } = {};
  const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const extension = filename.split('.').pop() || 'jpg';

  // Process each size
  for (const [sizeName, sizeOptions] of Object.entries(sizes)) {
    const outputFilename = `${baseFilename}-${sizeName}.${extension}`;
    const outputPath = join(outputDir, outputFilename);

    try {
      let sharpInstance = sharp(inputPath);

      // Apply transformations
      if (sizeOptions.width && sizeOptions.height) {
        sharpInstance = sharpInstance.resize(sizeOptions.width, sizeOptions.height, {
          fit: sizeOptions.fit,
          position
        });
      }

      // Apply format-specific options
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({
          quality,
          progressive,
          mozjpeg
        });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({
          quality,
          progressive
        });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({
          quality,
          lossless: false
        });
      } else if (format === 'avif') {
        sharpInstance = sharpInstance.avif({
          quality,
          lossless: false
        });
      }

      await sharpInstance.toFile(outputPath);
      results[sizeName] = `/uploads/products/${outputFilename}`;
    } catch (error) {
      console.error(`Error processing ${sizeName} size:`, error);
      // Fallback to original if processing fails
      results[sizeName] = `/uploads/products/${filename}`;
    }
  }

  return {
    original: `/uploads/products/${filename}`,
    thumbnail: results.thumbnail,
    medium: results.medium,
    large: results.large,
    sizes: results
  };
}

/**
 * Optimize multiple images in batch
 */
export async function optimizeImages(
  images: Array<{ path: string; filename: string }>,
  outputDir: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult[]> {
  const results = await Promise.all(
    images.map(({ path, filename }) =>
      optimizeImage(path, outputDir, filename, options)
    )
  );

  return results;
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${filePath}:`, error);
      }
    })
  );
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(imagePath: string, sizes: number[]): string {
  return sizes
    .map(size => `${imagePath}?w=${size} ${size}w`)
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
 * Image optimization presets for different use cases
 */
export const imagePresets = {
  productGallery: {
    quality: 85,
    format: 'jpeg' as const,
    fit: 'inside' as const,
    progressive: true,
    mozjpeg: true
  },
  
  productThumbnail: {
    quality: 80,
    format: 'jpeg' as const,
    fit: 'cover' as const,
    progressive: true,
    mozjpeg: true
  },
  
  heroImage: {
    quality: 90,
    format: 'jpeg' as const,
    fit: 'inside' as const,
    progressive: true,
    mozjpeg: true
  },
  
  avatar: {
    quality: 80,
    format: 'jpeg' as const,
    fit: 'cover' as const,
    progressive: true,
    mozjpeg: true
  }
};

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, WebP, or GIF' };
  }

  return { valid: true };
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}
