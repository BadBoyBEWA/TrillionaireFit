import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://trillionairefit.com${item.href}` : undefined
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <nav className="flex items-center space-x-2 text-sm text-zinc-600 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-zinc-900 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-900 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
