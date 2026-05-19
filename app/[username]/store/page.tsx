'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  ShoppingBag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';
import type { StoreProduct } from '@/types';

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

interface ServiceSlotsPayload {
  slots?: Array<{ start: string; end: string }>;
}

interface SlotHoldPayload {
  id: number;
  hold_token?: string | null;
  hold_expires_at?: string | null;
  slot_start?: string;
  slot_end?: string;
}

interface PaymentInitPayload {
  authorization_url?: string;
  reference?: string;
}

const dayKeyFromIso = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function PublicStorePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [store, setStore] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const productGridRef = useRef<HTMLDivElement | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [cartItems, setCartItems] = useState<Array<{ product_id: number; quantity: number }>>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);

  const [buyer, setBuyer] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [slots, setSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [slotHold, setSlotHold] = useState<{
    id: number;
    hold_token?: string | null;
    hold_expires_at?: string | null;
    slot_start: string;
    slot_end: string;
  } | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number>(0);
  const [holdingSlot, setHoldingSlot] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<{ url: string; reference: string } | null>(null);

  const isServiceCheckout = Boolean(selectedProduct);

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

  useEffect(() => {
    if (!isCartOpen && !isCheckoutOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isCartOpen, isCheckoutOpen]);

  const storeTitle = useMemo(() => {
    if (!store) return '';
    const name = `${store.creator.first_name || ''} ${store.creator.last_name || ''}`.trim();
    return name || store.creator.username;
  }, [store]);

  const cartProductMap = useMemo(() => {
    const map = new Map<number, StoreProduct>();
    (store?.products || []).forEach((product) => map.set(product.id, product));
    return map;
  }, [store]);

  const cartDetailedItems = useMemo(() => {
    return cartItems
      .map((item) => ({ item, product: cartProductMap.get(item.product_id) }))
      .filter((entry) => Boolean(entry.product)) as Array<{ item: { product_id: number; quantity: number }; product: StoreProduct }>;
  }, [cartItems, cartProductMap]);

  const cartItemCount = useMemo(() => cartDetailedItems.reduce((sum, entry) => sum + entry.item.quantity, 0), [cartDetailedItems]);
  const cartSubtotal = useMemo(() => cartDetailedItems.reduce((sum, entry) => sum + (entry.product.price * entry.item.quantity), 0), [cartDetailedItems]);
  const cartHasPhysical = useMemo(() => cartDetailedItems.some((entry) => entry.product.type === 'physical'), [cartDetailedItems]);
  const cartPlatformFee = useMemo(() => Number((cartSubtotal * 0.025).toFixed(2)), [cartSubtotal]);
  const cartTotal = useMemo(() => Number((cartSubtotal + cartPlatformFee).toFixed(2)), [cartSubtotal, cartPlatformFee]);

  const servicePlatformFee = useMemo(() => Number((((selectedProduct?.price || 0) * 0.025)).toFixed(2)), [selectedProduct]);
  const serviceTotal = useMemo(() => Number((((selectedProduct?.price || 0) + servicePlatformFee)).toFixed(2)), [selectedProduct, servicePlatformFee]);

  const filteredProducts = useMemo(() => {
    const products = (store?.products || []).filter((product) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return product.title.toLowerCase().includes(q) || (product.description || '').toLowerCase().includes(q);
    });

    return products.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime());
    });
  }, [store?.products, query, sort]);

  const productsPerPage = 9;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!productGridRef.current) return;
    productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, Array<{ start: string; end: string }>>();
    slots.forEach((slot) => {
      const key = dayKeyFromIso(slot.start);
      const current = grouped.get(key) || [];
      current.push(slot);
      grouped.set(key, current);
    });
    return grouped;
  }, [slots]);

  const availableDayKeys = useMemo(() => Array.from(slotsByDay.keys()).sort(), [slotsByDay]);

  const selectedDaySlots = useMemo(() => {
    if (!selectedDayKey) return [];
    const daySlots = slotsByDay.get(selectedDayKey) || [];
    return [...daySlots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [selectedDayKey, slotsByDay]);

  const monthGrid = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; key: string; inMonth: boolean }> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      const d = new Date(year, month, i - firstWeekday + 1);
      cells.push({ date: d, key: dayKeyFromIso(d.toISOString()), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      cells.push({ date: d, key: dayKeyFromIso(d.toISOString()), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const d = new Date(year, month + 1, cells.length - (firstWeekday + daysInMonth) + 1);
      cells.push({ date: d, key: dayKeyFromIso(d.toISOString()), inMonth: false });
    }

    return cells;
  }, [visibleMonth]);

  useEffect(() => {
    if (!slotHold?.hold_expires_at) {
      setHoldSecondsLeft(0);
      return;
    }

    const tick = () => {
      const expiresAt = new Date(slotHold.hold_expires_at as string).getTime();
      const seconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setHoldSecondsLeft(seconds);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [slotHold?.hold_expires_at]);

  const loadServiceSlotsForMonth = useCallback(async (productId: number, monthDate: Date) => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const now = new Date();
    const from = monthStart < now ? now : monthStart;
    const to = monthEnd;

    if (from > to) {
      setSlots([]);
      setSelectedDayKey(null);
      setSelectedSlot(null);
      setSlotHold(null);
      setHoldSecondsLeft(0);
      return;
    }

    setSlotsLoading(true);
    try {
      const res = await storeApi.listServiceSlots(username, productId, {
        from: from.toISOString(),
        to: to.toISOString(),
      });

      if (res.success && res.data) {
        const payload = res.data as ServiceSlotsPayload;
        const fetchedSlots = payload.slots || [];
        setSlots(fetchedSlots);
        setSelectedSlot(null);
        setSlotHold(null);
        setHoldSecondsLeft(0);

        if (fetchedSlots.length > 0) {
          const firstDay = dayKeyFromIso(fetchedSlots[0].start);
          setSelectedDayKey((prev) => (prev && fetchedSlots.some((slot) => dayKeyFromIso(slot.start) === prev) ? prev : firstDay));
        } else {
          setSelectedDayKey(null);
        }
      } else {
        setSlots([]);
        setSelectedDayKey(null);
      }
    } finally {
      setSlotsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (!selectedProduct || selectedProduct.type !== 'service') return;
    loadServiceSlotsForMonth(selectedProduct.id, visibleMonth);
  }, [selectedProduct, visibleMonth, loadServiceSlotsForMonth]);

  const createSlotHold = async (slot: { start: string; end: string }) => {
    if (!selectedProduct || selectedProduct.type !== 'service') return null;
    setHoldingSlot(true);
    try {
      const holdRes = await storeApi.holdServiceSlot(username, selectedProduct.id, {
        slot_start: slot.start,
        slot_end: slot.end,
        buyer_email: buyer.email || undefined,
        buyer_name: buyer.name || undefined,
        buyer_phone: buyer.phone || undefined,
        notes: buyer.notes || undefined,
      });

      if (!holdRes.success || !holdRes.data) {
        throw new Error(holdRes.message || 'Unable to hold this slot. Please choose another time.');
      }

      const holdData = holdRes.data as SlotHoldPayload;
      const nextHold = {
        id: holdData.id as number,
        hold_token: holdData.hold_token || null,
        hold_expires_at: holdData.hold_expires_at || null,
        slot_start: holdData.slot_start || slot.start,
        slot_end: holdData.slot_end || slot.end,
      };

      setSlotHold(nextHold);
      return nextHold;
    } finally {
      setHoldingSlot(false);
    }
  };

  const handleSelectSlot = async (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
    setError(null);
    try {
      await createSlotHold(slot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to hold this slot');
    }
  };

  const addToCart = (product: StoreProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.product_id === product.id);
      if (existing) {
        return prev.map((p) => p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { product_id: product.id, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleOpenServiceCheckout = (product: StoreProduct) => {
    setSelectedProduct(product);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
    setSelectedSlot(null);
    setSelectedDayKey(null);
    setVisibleMonth(new Date());
    setSlotHold(null);
    setHoldSecondsLeft(0);
    setRedirectInfo(null);
    setError(null);
  };

  const openCartCheckout = () => {
    if (cartItems.length === 0) return;
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
    setError(null);
    setRedirectInfo(null);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setRedirectInfo(null);
  };

  const proceedFromStepOne = () => {
    if (!buyer.email) {
      setError('Email is required');
      return;
    }
    if (!buyer.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!buyer.phone.trim()) {
      setError('Phone is required');
      return;
    }
    setError(null);
    setCheckoutStep(2);
  };

  const proceedFromStepTwo = () => {
    if (isServiceCheckout && selectedProduct?.type === 'service' && !selectedSlot) {
      setError('Select a time slot');
      return;
    }

    if ((!isServiceCheckout && cartHasPhysical) || (isServiceCheckout && selectedProduct?.type === 'physical')) {
      if (!buyer.address.trim()) {
        setError('Delivery address is required');
        return;
      }
    }

    if (!isServiceCheckout && cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError(null);
    setCheckoutStep(3);
  };

  const handleCheckout = async () => {
    if (!selectedProduct && !isCheckoutOpen) return;
    if (!buyer.email) {
      setError('Email is required');
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      let holdPayload: { id: number; hold_token?: string | null } | null = null;

      if (isServiceCheckout && selectedProduct?.type === 'service') {
        if (!selectedSlot) throw new Error('Select a time slot');

        const isSameSlotHeld =
          slotHold &&
          slotHold.slot_start === selectedSlot.start &&
          slotHold.slot_end === selectedSlot.end &&
          holdSecondsLeft > 15;

        if (isSameSlotHeld) {
          holdPayload = { id: slotHold.id, hold_token: slotHold.hold_token || null };
        } else {
          const refreshedHold = await createSlotHold(selectedSlot);
          if (!refreshedHold) throw new Error('Unable to hold this slot. Please choose another time.');
          holdPayload = { id: refreshedHold.id, hold_token: refreshedHold.hold_token || null };
        }
      }

      const res = isServiceCheckout && selectedProduct
        ? await storeApi.initiatePurchase(username, selectedProduct.id, {
            buyer_email: buyer.email,
            buyer_name: buyer.name,
            buyer_phone: buyer.phone,
            delivery_address: selectedProduct.type === 'physical' ? { address: buyer.address } : undefined,
            hold_booking_id: selectedProduct.type === 'service' ? holdPayload?.id : undefined,
            hold_token: selectedProduct.type === 'service' ? holdPayload?.hold_token || undefined : undefined,
            slot_start: selectedProduct.type === 'service' ? selectedSlot?.start : undefined,
            slot_end: selectedProduct.type === 'service' ? selectedSlot?.end : undefined,
          })
        : await storeApi.checkoutCart(username, {
            buyer_email: buyer.email,
            buyer_name: buyer.name,
            buyer_phone: buyer.phone,
            delivery_address: cartHasPhysical ? { address: buyer.address } : undefined,
            items: cartItems,
          });

      if (res.success && res.data) {
        const paymentData = res.data as PaymentInitPayload;
        const authUrl = paymentData.authorization_url;
        const reference = paymentData.reference || '';

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

  return (
    <div data-theme="light" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">{storeTitle || 'Store'}</p>
            <p className="text-xs text-slate-500">@{store?.creator.username}</p>
          </div>
          <Button variant="outline" onClick={() => setIsCartOpen(true)} className="relative border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Cart
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
              {cartItemCount}
            </span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!store ? (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 text-center text-slate-600">Store not found.</CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{storeTitle}</h1>
              <p className="text-slate-500">Storefront</p>
              {store.creator.bio && <p className="text-slate-600 mt-2 max-w-2xl mx-auto">{store.creator.bio}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  className="pl-9 !bg-white !text-slate-900 !border-slate-300 placeholder:!text-slate-500"
                  placeholder="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
              </select>
            </div>

            <div ref={productGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="group !bg-white border !border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-5 space-y-3">
                    {product.cover_url && (
                      <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                        <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-slate-900 line-clamp-1">{product.title}</p>
                      <span className="text-[10px] font-semibold text-slate-600 uppercase border border-slate-200 bg-slate-50 rounded-full px-2 py-1">
                        {product.type}
                      </span>
                    </div>
                    {product.description && <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>}
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold tracking-tight text-slate-900">₦{product.price.toLocaleString()}</p>
                      {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                        <span className="text-xs text-slate-500">Stock: {product.stock_quantity}</span>
                      )}
                    </div>

                    {product.type === 'service' ? (
                      <Button onClick={() => handleOpenServiceCheckout(product)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        <Calendar className="h-4 w-4 mr-2" /> Book now
                      </Button>
                    ) : (
                      <Button onClick={() => addToCart(product)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Add to cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length > productsPerPage && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-300 bg-white text-slate-700"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? '' : 'border-slate-300 bg-white text-slate-700'}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-300 bg-white text-slate-700"
                >
                  Next
                </Button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <Card className="border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 text-center text-slate-600">No products match your search.</CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45" onClick={() => setIsCartOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-slate-200 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {cartDetailedItems.length === 0 ? (
              <p className="text-sm text-slate-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cartDetailedItems.map(({ item, product }) => (
                  <div key={product.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.title}</p>
                        <p className="text-xs text-slate-600">₦{product.price.toLocaleString()} each</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCartItems((prev) => prev.filter((p) => p.product_id !== product.id))}>
                        Remove
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCartItems((prev) => prev.map((p) => p.product_id === product.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}>-</Button>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => setCartItems((prev) => prev.map((p) => p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p))}>+</Button>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₦{cartSubtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Platform fee</span><span>₦{cartPlatformFee.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200"><span>Total</span><span>₦{cartTotal.toLocaleString()}</span></div>
                </div>

                <Button onClick={openCartCheckout} className="w-full">Checkout</Button>
              </div>
            )}
          </aside>
        </>
      )}

      {isCheckoutOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45" onClick={closeCheckout} />
          <div className="fixed inset-0 z-50 p-4 sm:p-8 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Checkout</h2>
                <Button variant="ghost" size="icon" onClick={closeCheckout}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`h-1.5 rounded-full ${checkoutStep >= step ? 'bg-primary' : 'bg-border'}`} />
                  ))}
                </div>

                {checkoutStep === 1 && (
                  <>
                    <p className="text-sm text-slate-600">Step 1: Buyer details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Email" type="email" value={buyer.email} onChange={(e) => setBuyer((prev) => ({ ...prev, email: e.target.value }))} />
                      <Input label="Name" value={buyer.name} onChange={(e) => setBuyer((prev) => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <Input label="Phone" value={buyer.phone} onChange={(e) => setBuyer((prev) => ({ ...prev, phone: e.target.value }))} />
                  </>
                )}

                {checkoutStep === 2 && ((!isServiceCheckout && cartHasPhysical) || (isServiceCheckout && selectedProduct?.type === 'physical')) && (
                  <Textarea
                    label="Delivery address"
                    value={buyer.address}
                    onChange={(e) => setBuyer((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                )}

                {checkoutStep === 2 && isServiceCheckout && selectedProduct?.type === 'service' && (
                  <div className="space-y-3">
                    <Textarea label="Booking notes (optional)" value={buyer.notes} onChange={(e) => setBuyer((prev) => ({ ...prev, notes: e.target.value }))} rows={2} />
                    <div className="space-y-2">
                      <p className="text-sm text-slate-900">Select a day, then pick a time</p>
                      {slotsLoading ? (
                        <p className="text-sm text-slate-600">Loading available slots...</p>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-slate-600">No slots available right now.</p>
                      ) : (
                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="text-sm font-semibold text-slate-900">{visibleMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</p>
                            <button type="button" onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="overflow-x-auto">
                            <div className="min-w-[20.5rem] space-y-1">
                              <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="text-center py-1">{day}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {monthGrid.map((cell) => {
                                  const hasAvailability = availableDayKeys.includes(cell.key);
                                  const isSelected = selectedDayKey === cell.key;
                                  return (
                                    <button
                                      key={`${cell.key}-${cell.inMonth ? 'm' : 'o'}`}
                                      type="button"
                                      disabled={!hasAvailability}
                                      onClick={() => {
                                        setSelectedDayKey(cell.key);
                                        setSelectedSlot(null);
                                        setSlotHold(null);
                                        setHoldSecondsLeft(0);
                                      }}
                                      className={`h-10 rounded-lg border text-sm font-semibold ${
                                        !cell.inMonth
                                          ? 'border-transparent text-slate-400'
                                          : hasAvailability
                                            ? isSelected
                                              ? 'border-primary bg-primary text-white'
                                              : 'border-slate-300 bg-white text-slate-900 hover:border-primary/60'
                                            : 'border-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {cell.date.getDate()}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs text-slate-600">
                              {selectedDayKey ? `Available times for ${new Date(`${selectedDayKey}T00:00:00`).toLocaleDateString()}` : 'Select an available day'}
                            </p>
                            {selectedDayKey && selectedDaySlots.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {selectedDaySlots.map((slot) => {
                                  const isActive = selectedSlot?.start === slot.start;
                                  return (
                                    <button
                                      key={slot.start}
                                      type="button"
                                      onClick={() => handleSelectSlot(slot)}
                                      className={`px-3 py-2 rounded-lg border text-sm ${isActive ? 'border-primary bg-primary/15 text-slate-900' : 'border-slate-300 text-slate-800 bg-white'}`}
                                    >
                                      {new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600">No times available for this day.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedSlot && (
                        <p className={`text-xs flex items-center gap-1 ${holdSecondsLeft > 0 ? 'text-green-500' : 'text-amber-500'}`}>
                          <Clock className="h-3 w-3" />
                          {holdingSlot
                            ? 'Holding slot...'
                            : holdSecondsLeft > 0
                              ? `Slot held for ${Math.floor(holdSecondsLeft / 60)}:${String(holdSecondsLeft % 60).padStart(2, '0')}`
                              : 'Slot is not currently held. It will be held when you continue.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && ((!isServiceCheckout && !cartHasPhysical) || (isServiceCheckout && selectedProduct?.type === 'digital')) && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No extra details needed. Continue to review.
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                    {isServiceCheckout && selectedProduct ? (
                      <p><span className="text-slate-600">Product:</span> <span className="text-slate-900 font-medium">{selectedProduct.title}</span></p>
                    ) : (
                      <p><span className="text-slate-600">Items:</span> <span className="text-slate-900 font-medium">{cartDetailedItems.length}</span></p>
                    )}
                    <p><span className="text-slate-600">Buyer:</span> <span className="text-slate-900">{buyer.email}</span></p>
                    {isServiceCheckout && selectedProduct?.type === 'service' && selectedSlot && (
                      <p><span className="text-slate-600">Slot:</span> <span className="text-slate-900">{new Date(selectedSlot.start).toLocaleString()}</span></p>
                    )}
                    {((isServiceCheckout && selectedProduct?.type === 'physical') || (!isServiceCheckout && cartHasPhysical)) && buyer.address && (
                      <p><span className="text-slate-600">Address:</span> <span className="text-slate-900">{buyer.address}</span></p>
                    )}
                    <p className="pt-2 border-t border-slate-200"><span className="text-slate-600">Subtotal:</span> <span className="text-slate-900 font-semibold">₦{(isServiceCheckout && selectedProduct ? selectedProduct.price : cartSubtotal).toLocaleString()}</span></p>
                    <p><span className="text-slate-600">Platform Fee (2.5%):</span> <span className="text-slate-900">₦{(isServiceCheckout ? servicePlatformFee : cartPlatformFee).toLocaleString()}</span></p>
                    <p><span className="text-slate-600">Total Payable:</span> <span className="text-slate-900 font-semibold">₦{(isServiceCheckout ? serviceTotal : cartTotal).toLocaleString()}</span></p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {checkoutStep > 1 && (
                    <Button variant="outline" onClick={() => setCheckoutStep((prev) => (prev - 1) as 1 | 2 | 3)}>
                      Back
                    </Button>
                  )}
                  {checkoutStep === 1 && <Button onClick={proceedFromStepOne} className="sm:ml-auto">Continue</Button>}
                  {checkoutStep === 2 && <Button onClick={proceedFromStepTwo} className="sm:ml-auto">Review</Button>}
                  {checkoutStep === 3 && (
                    <Button onClick={handleCheckout} disabled={checkoutLoading} className="sm:ml-auto">
                      {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Proceed to payment
                    </Button>
                  )}
                </div>

                {redirectInfo && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                    <p className="font-medium text-slate-900 mb-1">Redirecting to payment…</p>
                    <div className="mt-2 rounded-lg border-2 border-red-500 bg-red-500/15 p-3">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-red-200">Warning: Do not exit this checkout flow.</p>
                      <p className="mt-1 text-xs font-semibold text-red-100">Even after successful payment, stay in this flow until you are redirected back to Linkverse.</p>
                    </div>
                    <p>If you are not redirected, click the button below:</p>
                    <Button variant="outline" className="mt-2 w-full" onClick={() => (window.location.href = redirectInfo.url)}>Continue to payment</Button>
                    <p className="mt-2 text-xs">If you complete payment but don’t get redirected back, visit: <span className="font-mono">/payment/store?reference={redirectInfo.reference}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {cartItemCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-4 right-4 z-30 sm:hidden">
          <Button onClick={() => setIsCartOpen(true)} className="shadow-medium">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {cartItemCount} item{cartItemCount > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
