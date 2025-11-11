'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, HeartSolidIcon } from '@/components/ui/SocialIcons';
import { useAuth } from '@/context/AuthContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistButton({ 
  productId, 
  className = '',
  onToggle 
}: WishlistButtonProps) {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const isInList = data.products.some((product: any) => product._id === productId);
        setIsInWishlist(isInList);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const handleToggle = async () => {
    if (!user) {
      setError('Please login to add to wishlist');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          setIsInWishlist(false);
          onToggle?.(false);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          setIsInWishlist(true);
          onToggle?.(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Wishlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          isInWishlist
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist ? (
          <HeartSolidIcon className="h-5 w-5" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}


