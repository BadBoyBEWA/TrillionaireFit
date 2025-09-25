import { Metadata } from 'next';
import { publicConfig } from './config';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  price,
  currency = 'NGN',
  availability,
  brand,
  category
}: SEOProps): Metadata {
  const siteName = publicConfig.siteName;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || 'Trillionaire Fit — Luxury fashion marketplace featuring curated designer pieces from around the world.';
  const fullImage = image || '/image/TF_Logo_1.jpg';
  const fullUrl = url || 'https://trillionairefit.com';

  const baseKeywords = [
    'luxury fashion',
    'designer clothes',
    'high-end fashion',
    'premium clothing',
    'fashion marketplace',
    'trillionaire fit',
    'luxury brands',
    'fashion boutique',
    'designer wear',
    'premium fashion'
  ];

  const allKeywords = [...baseKeywords, ...keywords, ...tags].join(', ');

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: [{ name: author || siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(fullUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type: 'website', // Always use 'website' for Next.js compatibility
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        section,
        tags,
      }),
      // Note: Product-specific OpenGraph data will be handled via manual meta tags
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@trillionairefit',
      site: '@trillionairefit',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
  };

  return metadata;
}

export function generateProductMetadata(product: {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  designer?: string;
  category?: string;
  id: string;
}): Metadata {
  return generateMetadata({
    title: `${product.name} by ${product.designer || 'Designer'}`,
    description: product.description || `Shop ${product.name} by ${product.designer || 'Designer'} at Trillionaire Fit. Premium luxury fashion with worldwide shipping.`,
    keywords: [
      product.name.toLowerCase(),
      product.designer?.toLowerCase() || '',
      product.category?.toLowerCase() || '',
      'luxury fashion',
      'designer clothes',
      'premium clothing'
    ].filter(Boolean),
    image: product.images?.[0] || '/image/TF_Logo_1.jpg',
    url: `https://trillionairefit.com/product/${product.id}`,
    type: 'product',
    price: product.price,
    currency: 'NGN',
    availability: 'in stock',
    brand: product.designer,
    category: product.category,
  });
}

export function generateCategoryMetadata(category: string, description?: string): Metadata {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return generateMetadata({
    title: `${categoryTitle} Collection`,
    description: description || `Explore our curated ${categoryTitle.toLowerCase()} collection featuring luxury designer pieces. Premium quality and worldwide shipping.`,
    keywords: [
      category.toLowerCase(),
      `${category.toLowerCase()} collection`,
      'luxury fashion',
      'designer clothes',
      'premium clothing'
    ],
    url: `https://trillionairefit.com/${category}`,
    type: 'website',
  });
}
