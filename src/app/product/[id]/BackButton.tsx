'use client';

import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

export function BackButton() {
  const { navigateBack } = useNavigationWithLoading();

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={navigateBack}
        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
