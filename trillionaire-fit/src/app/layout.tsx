import type { Metadata } from 'next';
import './globals.css';
import { publicConfig } from '@/lib/config';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { GlobalLoadingScreen } from '@/components/ui/GlobalLoadingScreen';
import { MarqueeText } from '@/components/ui/Marquee';
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Luxury Fashion Marketplace',
  description: 'Trillionaire Fit — Discover the world\'s most coveted designers and emerging labels. Shop luxury fashion across boutiques worldwide with seamless checkout and premium quality.',
  keywords: [
    'luxury fashion',
    'designer clothes',
    'high-end fashion',
    'premium clothing',
    'fashion marketplace',
    'luxury brands',
    'designer wear',
    'premium fashion',
    'boutique shopping',
    'worldwide shipping'
  ],
  url: 'https://trillionairefit.com',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": publicConfig.siteName,
    "url": "https://trillionairefit.com",
    "logo": "https://trillionairefit.com/image/TF_Logo_1.jpg",
    "description": "Luxury fashion marketplace featuring curated designer pieces from around the world",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@trillionairefit.com"
    },
    "sameAs": [
      "https://instagram.com/trillionairefit",
      "https://twitter.com/trillionairefit",
      "https://facebook.com/trillionairefit"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NG"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": publicConfig.siteName,
    "url": "https://trillionairefit.com",
    "description": "Luxury fashion marketplace featuring curated designer pieces from around the world",
    "publisher": {
      "@type": "Organization",
      "name": publicConfig.siteName
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://trillionairefit.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" 
          rel="stylesheet" 
        />
        {/* Favicon */}
        <link rel="icon" href="/image/TF_Logo_1.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/image/TF_Logo_1.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased font-luxury-body">
        <ErrorBoundary>
          <AuthProvider>
            <LoadingProvider>
              <CartProvider>
                <GlobalLoadingScreen />
                <Navbar />
                <div className="bg-black text-white py-2">
                  <MarqueeText text= "We accept Payment in CryptoCurrency just contact us on whatsapp To get your order" />
                </div>
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
