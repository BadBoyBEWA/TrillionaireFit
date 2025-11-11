'use client';

import { useState, useEffect } from 'react';
import { AddToCartButton } from './AddToCartButton';
import { ProductCard } from '@/components/product/ProductCard';
import { BackButton } from './BackButton';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductReviews from '@/components/product/ProductReviews';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import SocialShare from '@/components/social/SocialShare';
import WishlistButton from '@/components/wishlist/WishlistButton';
import { ProductStructuredData } from '@/components/seo/ProductStructuredData';
import { ProductOpenGraph } from '@/components/seo/ProductOpenGraph';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { recentlyViewed } from '@/lib/recently-viewed';
import { Product } from '@/lib/types';

type Props = { params: { id: string } };

// Using Product type from lib/types instead of local interface

export default function ProductDetail({ params }: Props) {
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { navigate } = useNavigationWithLoading();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        const productData = data.product || data;
        setProduct(productData);
        
        // Add to recently viewed
        if (productData) {
          recentlyViewed.add({
            id: productData._id,
            name: productData.name,
            designer: productData.designer,
            price: productData.price,
            image: productData.images?.[0] || '/placeholder-product.jpg'
          });
        }
        
        // Fetch similar products (same category, different product)
        if (productData.category) {
          const similarResponse = await fetch(`/api/products?category=${productData.category}&limit=4&exclude=${id}`);
          if (similarResponse.ok) {
            const similarData = await similarResponse.json();
            setSimilarProducts(similarData.products || []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  if (loading) {
    return (
      <div className="space-y-12">
        <BackButton />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="space-y-12">
        <BackButton />
        <div className="text-center py-12">
          <h1 className="text-2xl font-luxury-heading mb-4">Product not found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* OpenGraph Meta Tags */}
      {product && <ProductOpenGraph product={product} />}
      
      {/* Structured Data */}
      {product && <ProductStructuredData product={product} />}
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: product.category || 'Fashion', href: `/${product.category?.toLowerCase()}` },
          { label: product.name }
        ]} 
      />
      
      {/* Back Navigation */}
      <BackButton />

      {/* Product Details */}
      <div className="grid gap-6 lg:gap-10 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <ProductImageGallery 
            images={product.images || []} 
            productName={product.name}
          />
        </div>
        <div className="space-y-4 lg:space-y-6">
          <div>
            <p className="text-zinc-500 text-sm sm:text-base font-luxury-elegant">{product.designer}</p>
            <h1 className="text-2xl sm:text-3xl font-luxury-display">{product.name}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-xl font-luxury-elegant">₦{(product.price || 0).toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > (product.price || 0) && (
              <p className="text-lg text-gray-500 line-through font-luxury-elegant">₦{product.originalPrice.toFixed(2)}</p>
            )}
            {product.discountPercentage && (
              <span className="bg-red-100 text-red-800 text-sm font-luxury-elegant px-2.5 py-0.5 rounded">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Availability:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-luxury-elegant ${
                (product.totalStock || 0) === 0 
                  ? 'bg-red-100 text-red-800' 
                  : (product.totalStock || 0) < 10 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {(product.totalStock || 0) > 0 ? `${product.totalStock} in stock` : 'Out of stock'}
              </span>
            </div>
            
            {(product.totalStock || 0) > 0 && (
              <div className="text-xs text-gray-500">
                {(product.totalStock || 0) < 10 ? '⚠️ Low stock - Order soon!' : '✅ In stock and ready to ship'}
              </div>
            )}
          </div>

          <p className="text-zinc-600">{product.description}</p>
          
          {/* Product Details */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">SKU:</span>
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {product.sku || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2">{product.category}</span>
              </div>
            </div>
            
            {product.materials && product.materials.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Materials:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.materials.map((material, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Available Sizes:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.sizes.map((size, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Available Colors:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.colors.map((color, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {product.careInstructions && (
              <div>
                <span className="text-gray-500 text-sm">Care Instructions:</span>
                <p className="mt-1 text-sm text-gray-700">{product.careInstructions}</p>
              </div>
            )}
            
            {product.shippingInfo && (
              <div>
                <span className="text-gray-500 text-sm">Shipping:</span>
                <div className="mt-1 text-sm">
                  {product.shippingInfo.freeShipping ? (
                    <span className="text-green-600 font-luxury-elegant">🆓 Free shipping</span>
                  ) : (
                    <span className="text-gray-700">Standard shipping</span>
                  )}
                  {product.shippingInfo.estimatedDays && (
                    <span className="ml-2 text-gray-600">
                      (Estimated {product.shippingInfo.estimatedDays} days)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <AddToCartButton id={product._id || ''} disabled={(product.totalStock || 0) === 0} />
            <button onClick={() => navigate('/cart')} className="btn-outline">View cart</button>
            </div>
            
            {/* Wishlist and Social Share */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <WishlistButton productId={product._id || ''} />
              <SocialShare 
                url={`${window.location.origin}/product/${product._id || ''}`}
                title={product.name}
                description={product.description}
                image={product.images?.[0]}
              />
            </div>
            
            {(product.totalStock || 0) === 0 && (
              <p className="text-red-600 text-sm">This product is currently out of stock</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product._id || ''} />

      {/* Product Recommendations */}
      <ProductRecommendations 
        currentProduct={product}
        allProducts={similarProducts}
        title="You Might Also Like"
        type="similar"
      />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-luxury-heading">Similar Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct._id} product={similarProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
