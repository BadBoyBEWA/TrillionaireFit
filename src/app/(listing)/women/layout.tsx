import { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/seo';

export const metadata: Metadata = generateCategoryMetadata(
  'women',
  'Explore our exclusive women\'s luxury fashion collection featuring elegant designer pieces from renowned brands. Shop premium womenswear with worldwide shipping.'
);

export default function WomenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
