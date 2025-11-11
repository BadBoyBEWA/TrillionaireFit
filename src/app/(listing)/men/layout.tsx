import { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/seo';

export const metadata: Metadata = generateCategoryMetadata(
  'men',
  'Discover our curated men\'s luxury fashion collection featuring premium designer pieces from top brands. Shop sophisticated menswear with worldwide shipping.'
);

export default function MenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
