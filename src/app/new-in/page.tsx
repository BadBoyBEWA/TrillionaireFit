'use client';

import PaginatedProductGrid from '@/components/product/PaginatedProductGrid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NewInPage() {
  return (
    <PaginatedProductGrid
      title="New In"
      fetchUrl="/api/products?sortBy=createdAt&sortOrder=desc&isActive=true"
      productsPerPage={8}
      showNavigation={true}
      showPagination={true}
    />
  );
}