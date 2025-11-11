'use client';

import PaginatedProductGrid from '@/components/product/PaginatedProductGrid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function WomenListingPage() {
  return (
    <PaginatedProductGrid
      title="Women's Collection"
      fetchUrl="/api/products?gender=women&isActive=true"
      productsPerPage={8}
      showNavigation={true}
      showPagination={true}
    />
  );
}
