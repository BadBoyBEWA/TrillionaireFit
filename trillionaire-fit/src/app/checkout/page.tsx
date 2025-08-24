"use client";

import { useCart } from '@/components/cart/CartProvider';

export default function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart();
  const hasItems = state.items.length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    alert('Order placed. Thank you!');
  };

  return (
    <div className="grid gap-10 md:grid-cols-3">
      <section className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="First name" required />
            <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="Last name" required />
          </div>
          <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" type="email" placeholder="Email" required />
          <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="Address" required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="City" required />
            <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="State" required />
            <input className="w-full rounded-lg border border-zinc-300 px-4 py-2" placeholder="ZIP" required />
          </div>
          <button className="btn-primary" disabled={!hasItems}>Place order</button>
        </form>
      </section>
      <aside className="space-y-4">
        <div className="card p-4">
          <h2 className="font-medium">Order summary</h2>
          {hasItems ? (
            <div className="mt-2 space-y-2 text-sm text-zinc-700">
              {state.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span>{product.name} × {quantity}</span>
                  <span>$ {(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <span>Subtotal</span>
                <span className="font-medium">$ {subtotal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-zinc-600">No items yet.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
