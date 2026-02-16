'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';
import type { StoreProduct, StoreProductType } from '@/types';

interface StorefrontData {
  creator: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar_url?: string;
  };
  products: StoreProduct[];
}

export default function PublicStorePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params.username;

  const [store, setStore] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [buyer, setBuyer] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [slots, setSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<{ url: string; reference: string } | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const response = await storeApi.getStorefront(username);
        if (response.success && response.data) {
          setStore(response.data as StorefrontData);
        } else {
          throw new Error(response.message || 'Store not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load store');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [username]);

  const storeTitle = useMemo(() => {
    if (!store) return '';
    const name = `${store.creator.first_name || ''} ${store.creator.last_name || ''}`.trim();
    return name || store.creator.username;
  }, [store]);

  const handleOpenCheckout = async (product: StoreProduct) => {
    setSelectedProduct(product);
    setSelectedSlot(null);
    setBuyer({ email: '', name: '', phone: '', address: '', notes: '' });
    if (product.type === 'service') {
      const from = new Date();
      const to = new Date();
      to.setDate(from.getDate() + 7);
      const res = await storeApi.listServiceSlots(username, product.id, {
        from: from.toISOString(),
        to: to.toISOString(),
      });
      if (res.success && res.data) {
        setSlots((res.data as any).slots || []);
      }
    } else {
      setSlots([]);
    }
  };

  const handleCheckout = async () => {
    if (!selectedProduct) return;
    if (!buyer.email) {
      setError('Email is required');
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      if (selectedProduct.type === 'service') {
        if (!selectedSlot) throw new Error('Select a time slot');
      }

      const res = await storeApi.initiatePurchase(username, selectedProduct.id, {
        buyer_email: buyer.email,
        buyer_name: buyer.name || undefined,
        buyer_phone: buyer.phone || undefined,
        delivery_address: selectedProduct.type === 'physical' ? { address: buyer.address } : undefined,
        slot_start: selectedProduct.type === 'service' ? selectedSlot?.start : undefined,
        slot_end: selectedProduct.type === 'service' ? selectedSlot?.end : undefined,
      });
      if (res.success && res.data) {
        const authUrl = (res.data as any).authorization_url;
        const reference = (res.data as any).reference as string;
        if (authUrl) {
          setRedirectInfo({ url: authUrl, reference });
          setTimeout(() => {
            window.location.href = authUrl;
          }, 1200);
          return;
        }
      }
      throw new Error(res.message || 'Failed to initiate payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{error || 'Store not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{storeTitle}</h1>
          <p className="text-text-secondary">@{store.creator.username} • Storefront</p>
          {store.creator.bio && <p className="text-text-secondary mt-2">{store.creator.bio}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {store.products.map((product) => (
            <Card key={product.id} className="shadow-soft">
              <CardContent className="p-5 space-y-3">
                {product.cover_url && (
                  <div className="w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img
                      src={product.cover_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">{product.title}</p>
                  <span className="text-xs text-text-secondary uppercase">{product.type}</span>
                </div>
                {product.description && <p className="text-sm text-text-secondary">{product.description}</p>}
                <p className="text-xl font-bold text-foreground">₦{product.price.toLocaleString()}</p>
                <Button onClick={() => handleOpenCheckout(product)} className="w-full">
                  {product.type === 'service' ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2" /> Book Service
                    </>
                  ) : product.type === 'digital' ? (
                    <>
                      <Download className="h-4 w-4 mr-2" /> Buy & Download
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" /> Buy Product
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedProduct && (
          <Card className="shadow-medium">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Checkout</h2>
                <Button variant="ghost" onClick={() => setSelectedProduct(null)}>Close</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={buyer.email}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Name"
                  value={buyer.name}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <Input
                label="Phone"
                value={buyer.phone}
                onChange={(e) => setBuyer((prev) => ({ ...prev, phone: e.target.value }))}
              />

              {selectedProduct.type === 'physical' && (
                <Textarea
                  label="Delivery address"
                  value={buyer.address}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              )}

              {selectedProduct.type === 'service' && (
                <div className="space-y-3">
                  <Textarea
                    label="Booking notes (optional)"
                    value={buyer.notes}
                    onChange={(e) => setBuyer((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary">Select a time slot</p>
                    {slots.length === 0 ? (
                      <p className="text-sm text-text-secondary">No slots available right now.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {slots.slice(0, 8).map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`text-left px-3 py-2 rounded-lg border ${
                              selectedSlot?.start === slot.start
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-text-secondary'
                            }`}
                          >
                            {new Date(slot.start).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full">
                {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Proceed to payment
              </Button>

              {redirectInfo && (
                <div className="mt-3 p-3 rounded-lg bg-muted border border-border text-sm text-text-secondary">
                  <p className="font-medium text-foreground mb-1">Redirecting to payment…</p>
                  <p>If you are not redirected, click the button below:</p>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => (window.location.href = redirectInfo.url)}
                  >
                    Continue to payment
                  </Button>
                  <p className="mt-2 text-xs">
                    If you complete payment but don’t get redirected back, visit:
                    <span className="font-mono"> /payment/store?reference={redirectInfo.reference}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
