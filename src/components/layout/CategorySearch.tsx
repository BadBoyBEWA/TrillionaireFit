'use client';

import { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface Category {
  _id: string;
  name: string;
  count: number;
  gender: string;
}

export function CategorySearch() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigationWithLoading();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string, gender?: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (gender) {
      params.set('gender', gender);
    }
    navigate(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Browse Categories</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Browse Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category.name, category.gender)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            {category.name}
            <span className="ml-1 text-gray-500">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
