import { Product } from '@/lib/types';

interface ProductStructuredDataProps {
  product: Product;
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Shop ${product.name} by ${product.designer || 'Designer'} at Trillionaire Fit.`,
    "image": product.images || ['/image/TF_Logo_1.jpg'],
    "brand": {
      "@type": "Brand",
      "name": product.designer || "Designer"
    },
    "category": product.category || "Fashion",
    "offers": {
      "@type": "Offer",
      "price": product.price || 0,
      "priceCurrency": "NGN",
      "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Trillionaire Fit"
      },
      "url": `https://trillionairefit.com/product/${product._id || product.id}`,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    },
    "aggregateRating": product.reviews && product.reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length,
      "reviewCount": product.reviews.length,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "review": product.reviews?.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.userName || "Anonymous"
      },
      "reviewBody": review.comment,
      "datePublished": review.createdAt || new Date().toISOString()
    })) || [],
    "sku": product._id || product.id,
    "mpn": product.sku || product._id || product.id,
    "gtin": product.barcode || product._id || product.id,
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(productSchema, (key, value) => 
    value === undefined ? undefined : value
  ));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema),
      }}
    />
  );
}
