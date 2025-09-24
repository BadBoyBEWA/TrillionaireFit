export const seoConfig = {
  site: {
    name: 'Trillionaire Fit',
    url: 'https://trillionairefit.com',
    description: 'Luxury fashion marketplace featuring curated designer pieces from around the world',
    logo: 'https://trillionairefit.com/image/TF_Logo_1.jpg',
    twitterHandle: '@trillionairefit',
    facebookPage: 'https://facebook.com/trillionairefit',
    instagramHandle: '@trillionairefit',
  },
  
  defaultMeta: {
    title: 'Trillionaire Fit - Luxury Fashion Marketplace',
    description: 'Discover the world\'s most coveted designers and emerging labels. Shop luxury fashion across boutiques worldwide with seamless checkout.',
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
    image: 'https://trillionairefit.com/image/TF_Logo_1.jpg',
  },

  pages: {
    home: {
      title: 'Luxury Fashion Marketplace - Designer Clothes & Premium Clothing',
      description: 'Discover the world\'s most coveted designers and emerging labels at Trillionaire Fit. Shop luxury fashion across boutiques worldwide with seamless checkout, premium quality, and worldwide shipping.',
      keywords: [
        'luxury fashion marketplace',
        'designer clothes online',
        'premium clothing store',
        'luxury fashion shopping',
        'high-end fashion brands',
        'designer fashion online',
        'luxury clothing marketplace',
        'premium fashion store'
      ]
    },
    
    men: {
      title: 'Men\'s Luxury Fashion Collection',
      description: 'Discover our curated men\'s luxury fashion collection featuring premium designer pieces from top brands. Shop sophisticated menswear with worldwide shipping.',
      keywords: [
        'mens luxury fashion',
        'designer menswear',
        'premium mens clothing',
        'luxury mens fashion',
        'high-end menswear',
        'designer mens clothes',
        'premium mens fashion',
        'luxury mens clothing'
      ]
    },
    
    women: {
      title: 'Women\'s Luxury Fashion Collection',
      description: 'Explore our exclusive women\'s luxury fashion collection featuring elegant designer pieces from renowned brands. Shop premium womenswear with worldwide shipping.',
      keywords: [
        'womens luxury fashion',
        'designer womenswear',
        'premium womens clothing',
        'luxury womens fashion',
        'high-end womenswear',
        'designer womens clothes',
        'premium womens fashion',
        'luxury womens clothing'
      ]
    },
    
    about: {
      title: 'About Trillionaire Fit - Luxury Fashion Curator',
      description: 'Learn about Trillionaire Fit\'s mission to democratize luxury fashion. Meet our founder and discover our curated approach to bringing exclusive designer pieces to your wardrobe.',
      keywords: [
        'about trillionaire fit',
        'luxury fashion founder',
        'curated fashion',
        'designer fashion marketplace',
        'luxury retail',
        'fashion curation',
        'exclusive fashion',
        'premium clothing'
      ]
    }
  },

  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Trillionaire Fit',
      url: 'https://trillionairefit.com',
      logo: 'https://trillionairefit.com/image/TF_Logo_1.jpg',
      description: 'Luxury fashion marketplace featuring curated designer pieces from around the world',
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@trillionairefit.com'
      },
      sameAs: [
        'https://instagram.com/trillionairefit',
        'https://twitter.com/trillionairefit',
        'https://facebook.com/trillionairefit'
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NG'
      }
    },
    
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Trillionaire Fit',
      url: 'https://trillionairefit.com',
      description: 'Luxury fashion marketplace featuring curated designer pieces from around the world',
      publisher: {
        '@type': 'Organization',
        name: 'Trillionaire Fit'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://trillionairefit.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  },

  performance: {
    imageOptimization: {
      quality: 85,
      formats: ['webp', 'avif'],
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      placeholder: 'blur'
    },
    
    caching: {
      staticAssets: 'public, max-age=31536000, immutable',
      apiResponses: 'public, max-age=300, s-maxage=300',
      sitemap: 'public, max-age=86400, s-maxage=86400'
    }
  }
};
