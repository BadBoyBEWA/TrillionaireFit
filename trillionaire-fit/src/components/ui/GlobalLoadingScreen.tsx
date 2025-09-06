'use client';

import { useLoading } from '@/contexts/LoadingContext';

export function GlobalLoadingScreen() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
        <p className="text-zinc-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
