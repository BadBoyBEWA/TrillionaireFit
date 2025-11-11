'use client';

import PaginatedProductGrid from '@/components/product/PaginatedProductGrid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SalePage() {
  return (
    <PaginatedProductGrid
      title="Sale"
      fetchUrl="/api/products?isOnSale=true&isActive=true"
      productsPerPage={8}
      showNavigation={true}
      showPagination={true}
    />
  );
}