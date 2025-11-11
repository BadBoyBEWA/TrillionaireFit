'use client';

import { useEffect } from 'react';

interface Product {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  designer?: string;
  category?: string;
  isActive?: boolean;
  totalStock?: number;
  sku?: string;
  materials?: string[];
  sizes?: string[];
  colors?: string[];
}

interface ProductOpenGraphProps {
  product: Product;
  baseUrl?: string;
}

export function ProductOpenGraph({ product, baseUrl = 'https://trillionairefit.com' }: ProductOpenGraphProps) {
  const productUrl = `${baseUrl}/product/${product._id || 'unknown'}`;
  const productImage = product.images?.[0] || `${baseUrl}/image/TF_Logo_1.jpg`;
  const availability = (product.totalStock || 0) > 0 ? 'in stock' : 'out of stock';
  const currency = 'NGN';
  
  useEffect(() => {
    // Function to update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Override the og:type to be 'product' for social scrapers
    updateMetaTag('og:type', 'product');
    
    // Product-specific OpenGraph meta tags
    updateMetaTag('product:price:amount', product.price.toString());
    updateMetaTag('product:price:currency', currency);
    updateMetaTag('product:availability', availability);
    updateMetaTag('product:condition', 'new');
    updateMetaTag('product:brand', product.designer || 'Trillionaire Fit');
    updateMetaTag('product:category', product.category || 'Fashion');
    
    // Additional product details
    if (product.sku) {
      updateMetaTag('product:retailer_item_id', product.sku);
    }
    
    // Enhanced product information
    updateMetaTag('og:title', `${product.name} by ${product.designer || 'Designer'} | Trillionaire Fit`);
    updateMetaTag('og:description', product.description || `Shop ${product.name} by ${product.designer || 'Designer'} at Trillionaire Fit. Premium luxury fashion with worldwide shipping.`);
    updateMetaTag('og:url', productUrl);
    updateMetaTag('og:image', productImage);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', product.name);
    
    // Additional images for product gallery
    if (product.images && product.images.length > 1) {
      product.images.slice(1, 4).forEach((image, index) => {
        updateMetaTag(`og:image:${index + 2}`, image);
      });
    }
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', `${product.name} by ${product.designer || 'Designer'}`, false);
    updateMetaTag('twitter:description', product.description || `Shop ${product.name} at Trillionaire Fit`, false);
    updateMetaTag('twitter:image', productImage, false);
    
    // Additional meta tags for better SEO
    updateMetaTag('description', product.description || `Shop ${product.name} by ${product.designer || 'Designer'} at Trillionaire Fit. Premium luxury fashion with worldwide shipping.`, false);
    updateMetaTag('keywords', `${product.name}, ${product.designer}, ${product.category}, luxury fashion, designer clothes, Trillionaire Fit`, false);

    // Add structured data script
    const existingScript = document.querySelector('script[data-product-structured-data]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-product-structured-data', 'true');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `Shop ${product.name} by ${product.designer || 'Designer'} at Trillionaire Fit.`,
      "image": product.images || [`${baseUrl}/image/TF_Logo_1.jpg`],
      "brand": {
        "@type": "Brand",
        "name": product.designer || "Trillionaire Fit"
      },
      "category": product.category || "Fashion",
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": currency,
        "availability": product.isActive && (product.totalStock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Trillionaire Fit"
        },
        "url": productUrl,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      "sku": product.sku || product._id || 'unknown',
      "mpn": product.sku || product._id || 'unknown',
      "gtin": product.sku || product._id || 'unknown',
      "url": productUrl
    });

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [product, baseUrl, productUrl, productImage, availability, currency]);

  // This component doesn't render anything visible
  return null;
}
