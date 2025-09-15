'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { CategorySearch } from '@/components/layout/CategorySearch';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface Product {
  _id: string;
  name: string;
  designer: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  gender: 'men' | 'women' | 'unisex';
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sku: string;
  totalStock: number;
  discountPercentage?: number;
  createdAt: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { navigate } = useNavigationWithLoading();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&page=${currentPage}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Search Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">
          {query ? `Search results for "${query}"` : 'Search Products'}
        </h1>
        <p className="text-gray-600">
          {products.length > 0 
            ? `Found ${products.length} product${products.length === 1 ? '' : 's'}`
            : 'No products found'
          }
        </p>
      </div>

      {/* Category Browse Section */}
      {!query && (
        <div className="max-w-4xl mx-auto">
          <CategorySearch />
        </div>
      )}

      {/* Search Results */}
      {products.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : query ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No products found</h2>
          <p className="text-gray-600 mb-6">
            Try searching with different keywords or browse our categories.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/men')}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Men
            </button>
            <button 
              onClick={() => navigate('/women')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Women
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Search Products</h2>
          <p className="text-gray-600 mb-6">
            Use the search bar in the navigation to find products.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}
