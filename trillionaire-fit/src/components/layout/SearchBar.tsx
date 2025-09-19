'use client';

import { useState, useRef, useEffect } from 'react';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface SearchResult {
  _id: string;
  name: string;
  designer: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  gender: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { navigate } = useNavigationWithLoading();

  // Popular search suggestions
  const suggestions = [
    'Sneakers', 'Dress', 'Jacket', 'Jeans', 'Shirt', 'Shoes', 
    'Handbag', 'Watch', 'Sunglasses', 'T-shirt', 'Pants', 'Coat'
  ];

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      setShowSuggestions(true);
      return;
    }
    
    // Hide suggestions when user starts typing
    setShowSuggestions(false);

    setLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length === 0) {
      setShowSuggestions(true);
      setIsOpen(false);
    } else {
      setShowSuggestions(false);
    }
    
    handleSearch(value);
  };

  const handleResultClick = (product: SearchResult) => {
    navigate(`/product/${product._id}`);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowSuggestions(false);
    } else if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setIsOpen(true);
    handleSearch(suggestion);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 1) {
              setIsOpen(true);
            } else {
              setShowSuggestions(true);
            }
          }}
          className="w-full md:w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product._id}
              onClick={() => handleResultClick(product)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-luxury-elegant text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">{product.designer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {product.subcategory}
                    </span>
                  )}
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                    {product.gender}
                  </span>
                </div>
                <p className="text-sm font-luxury-heading text-gray-900 mt-1">₦{product.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
          
          {/* View All Results */}
          <button
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-center text-sm font-luxury-elegant text-blue-600 hover:bg-blue-50 border-t border-gray-100"
          >
            View all results for "{query}"
          </button>
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3">
            <h4 className="text-sm font-luxury-elegant text-gray-700 mb-2">Popular searches</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 1 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 text-center text-gray-500 text-sm">
            No products found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
