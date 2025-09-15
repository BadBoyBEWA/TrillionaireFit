'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export function useNavigationWithLoading() {
  const router = useRouter();
  const { isLoading, setLoading } = useLoading();

  const navigate = (path: string) => {
    setLoading(true);
    router.push(path as any);
  };

  const navigateBack = () => {
    setLoading(true);
    router.back();
  };

  // Reset loading state when component mounts (navigation completed)
  useEffect(() => {
    // Add a minimum delay to make loading more visible
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [setLoading]);

  return {
    isLoading,
    navigate,
    navigateBack,
  };
}
