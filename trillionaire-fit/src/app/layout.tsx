import type { Metadata } from 'next';
import './globals.css';
import { publicConfig } from '@/lib/config';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';

export const metadata: Metadata = {
  title: publicConfig.siteName,
  description: 'Trillionaire Fit — Luxury fashion marketplace with a Farfetch-inspired UI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <CartProvider>
          <Navbar />
          <main className="container-responsive py-8">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
