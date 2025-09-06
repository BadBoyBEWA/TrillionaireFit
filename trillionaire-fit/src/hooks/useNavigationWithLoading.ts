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
    setLoading(false);
  }, [setLoading]);

  return {
    isLoading,
    navigate,
    navigateBack,
  };
}
