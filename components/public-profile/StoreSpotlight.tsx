import Link from 'next/link';
import { ArrowRight, CalendarDays, Download, Package, ShoppingBag } from 'lucide-react';
import type { StoreProduct } from '@/types';

interface StoreSpotlightProps {
  username: string;
  products: StoreProduct[];
}

const productIcon = {
  digital: Download,
  physical: Package,
  service: CalendarDays,
};

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency || 'NGN'} ${price.toLocaleString()}`;
  }
}

export function StoreSpotlight({ username, products }: StoreSpotlightProps) {
  if (!products.length) return null;

  return (
    <section className="mt-10" aria-labelledby="creator-store-heading">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.18em] opacity-60">From the creator</p>
          <h2 id="creator-store-heading" className="font-display text-2xl font-black tracking-[-0.045em]">Shop the good stuff</h2>
        </div>
        <Link href={`/${username}/store`} className="hidden items-center gap-1 text-sm font-extrabold underline-offset-4 hover:underline sm:flex">
          See the store <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {products.slice(0, 2).map((product) => {
          const Icon = productIcon[product.type] || ShoppingBag;
          return (
            <Link
              key={product.id}
              href={`/${username}/store`}
              className="group overflow-hidden rounded-[26px] border border-[color:color-mix(in_srgb,var(--creator-text)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--creator-text)_7%,transparent)] p-2 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:bg-[color:color-mix(in_srgb,var(--creator-text)_11%,transparent)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[color:color-mix(in_srgb,var(--creator-text)_10%,transparent)]">
                {product.cover_url ? (
                  <img src={product.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Icon className="h-8 w-8 opacity-55" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{product.title}</p>
                  <p className="mt-0.5 text-xs font-semibold opacity-65">{formatPrice(product.price, product.currency)}</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--creator-text)] text-[var(--creator-background)] transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href={`/${username}/store`} className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--creator-text)_20%,transparent)] text-sm font-extrabold sm:hidden">
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        Visit the store
      </Link>
    </section>
  );
}
