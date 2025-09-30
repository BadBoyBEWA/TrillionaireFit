'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginatedProductGridProps {
  title: string;
  fetchUrl: string;
  productsPerPage?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  className?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PaginatedProductGrid({
  title,
  fetchUrl,
  productsPerPage = 8,
  showNavigation = true,
  showPagination = true,
  className = ''
}: PaginatedProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: productsPerPage,
    total: 0,
    pages: 0
  });

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}page=${page}&limit=${productsPerPage}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        page,
        limit: productsPerPage,
        total: data.products?.length || 0,
        pages: 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchUrl, productsPerPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-luxury-heading">{title}</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-luxury-heading">{title}</h2>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => fetchProducts(currentPage)}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-luxury-heading">{title}</h2>
        {showNavigation && pagination.pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === pagination.pages}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="font-luxury-body">No products available at the moment.</p>
        </div>
      ) : (
        <>
          {/* Product Grid - 2x2 on mobile, responsive on larger screens */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={{
                  ...product,
                  id: product._id || product.id || '',
                  imageUrl: product.images?.[0] || product.imageUrl || '/api/placeholder/400/400'
                }} 
              />
            ))}
          </div>

          {/* Pagination */}
          {showPagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {renderPaginationNumbers()}
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Page Info */}
          {pagination.total > 0 && (
            <div className="text-center text-sm text-gray-600">
              <p className="font-luxury-elegant">
                Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, pagination.total)} of {pagination.total} products
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
