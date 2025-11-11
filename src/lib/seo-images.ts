import { publicConfig } from './config';

export interface SEOImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function generateImageProps({
  src,
  alt,
  width = 1200,
  height = 630,
  priority = false,
  className = ''
}: SEOImageProps) {
  return {
    src,
    alt,
    width,
    height,
    priority,
    className,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85,
  };
}

export function generateOGImageUrl(title: string, description?: string): string {
  const params = new URLSearchParams({
    title: title.substring(0, 60),
    ...(description && { description: description.substring(0, 120) }),
    siteName: publicConfig.siteName,
  });
  
  // This would typically point to an image generation service
  // For now, we'll use a placeholder
  return `/api/og-image?${params.toString()}`;
}

export function generateProductImageAlt(productName: string, designer?: string): string {
  return `${productName}${designer ? ` by ${designer}` : ''} - Luxury fashion at Trillionaire Fit`;
}

export function generateCategoryImageAlt(category: string): string {
  return `${category.charAt(0).toUpperCase() + category.slice(1)} luxury fashion collection at Trillionaire Fit`;
}
