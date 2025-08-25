import Link from 'next/link';
import { publicConfig } from '@/lib/config';
import { Suspense } from 'react';
import { CartIndicator } from './NavbarCartIndicator';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-responsive h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          {publicConfig.siteName}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link className="hover:underline" href="/women">Women</Link>
          <Link className="hover:underline" href="/men">Men</Link>
          <Link className="hover:underline" href="/new-in">New In</Link>
          <Link className="hover:underline" href="/sale">Sale</Link>
          <Suspense>
            <CartIndicator />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
