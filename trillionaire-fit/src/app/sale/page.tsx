import Link from 'next/link';

export default function SalePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sale</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Link key={i} href={`/product/${i + 300}`} className="card p-4">
            <div className="aspect-square w-full bg-zinc-100 rounded-lg" />
            <div className="mt-3">
              <p className="text-sm text-zinc-500">Designer</p>
              <p className="font-medium">Archive {i + 1}</p>
              <p className="text-sm text-green-600">Now $ {120 + i * 10}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
