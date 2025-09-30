'use client';

import PaginatedProductGrid from '@/components/product/PaginatedProductGrid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function MenListingPage() {
  return (
    <PaginatedProductGrid
      title="Men's Collection"
      fetchUrl="/api/products?gender=men&isActive=true"
      productsPerPage={8}
      showNavigation={true}
      showPagination={true}
    />
  );
}
