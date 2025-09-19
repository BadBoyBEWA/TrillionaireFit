import type { Metadata } from 'next';
import './globals.css';
import { publicConfig } from '@/lib/config';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { GlobalLoadingScreen } from '@/components/ui/GlobalLoadingScreen';
import { Marquee } from '@/components/layout/Marquee';
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: publicConfig.siteName,
  description: 'Trillionaire Fit — Luxury fashion marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased font-luxury-body">
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              <CartProvider>
                <GlobalLoadingScreen />
                <Navbar />
                <Marquee text="Store coming soon" />
                <main className="container-responsive py-8">
                  {children}
                </main>
                <Footer />
              </CartProvider>
            </LoadingProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
