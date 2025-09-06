import type { Metadata } from 'next';
import './globals.css';
import { publicConfig } from '@/lib/config';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { GlobalLoadingScreen } from '@/components/ui/GlobalLoadingScreen';
import { Marquee } from '@/components/layout/Marquee';

export const metadata: Metadata = {
  title: publicConfig.siteName,
  description: 'Trillionaire Fit — Luxury fashion marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <LoadingProvider>
          <CartProvider>
            <GlobalLoadingScreen />
            <Navbar />
            <Marquee text="Store coming soon" />
            <main className="container-responsive py-8">{children}</main>
            <Footer />
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
