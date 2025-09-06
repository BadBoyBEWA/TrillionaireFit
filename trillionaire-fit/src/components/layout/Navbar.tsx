'use client';

import { publicConfig } from '@/lib/config';
import { Suspense } from 'react';
import { CartIndicator } from './NavbarCartIndicator';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

export function Navbar() {
  const { navigate } = useNavigationWithLoading();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container-responsive h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            {publicConfig.siteName}
          </button>
          <nav className="flex items-center gap-6 text-sm">
            {/* <button onClick={() => navigate('/women')} className="hover:underline">Women</button> */}
            <button onClick={() => navigate('/men')} className="hover:underline">Men</button>
            <button onClick={() => navigate('/new-in')} className="hover:underline">New In</button>
            <button onClick={() => navigate('/sale')} className="hover:underline">Sale</button>
            <button onClick={() => navigate('/about')} className="hover:underline">About</button>
            <Suspense>
              <CartIndicator />
            </Suspense>
          </nav>
        </div>
      </header>
  );
}
