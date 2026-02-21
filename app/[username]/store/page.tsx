'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, Calendar, Download, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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

const dayKeyFromIso = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function PublicStorePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params.username;

  const [store, setStore] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
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

  const loadServiceSlotsForMonth = async (productId: number, monthDate: Date) => {
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
        const fetchedSlots = ((res.data as any).slots || []) as Array<{ start: string; end: string }>;
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
  };

  const handleOpenCheckout = async (product: StoreProduct) => {
    setSelectedProduct(product);
    setCheckoutStep(1);
    setSelectedSlot(null);
    setSelectedDayKey(null);
    setVisibleMonth(new Date());
    setSlotHold(null);
    setHoldSecondsLeft(0);
    setBuyer({ email: '', name: '', phone: '', address: '', notes: '' });
    if (product.type !== 'service') {
      setSlots([]);
    }
  };

  useEffect(() => {
    if (!selectedProduct || selectedProduct.type !== 'service') return;
    loadServiceSlotsForMonth(selectedProduct.id, visibleMonth);
  }, [selectedProduct, visibleMonth]);

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
      const holdData = holdRes.data as any;
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

  const handleCheckout = async () => {
    if (!selectedProduct) return;
    if (!buyer.email) {
      setError('Email is required');
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      let holdPayload: { id: number; hold_token?: string | null } | null = null;
      if (selectedProduct.type === 'service') {
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
          if (!refreshedHold) {
            throw new Error('Unable to hold this slot. Please choose another time.');
          }
          holdPayload = { id: refreshedHold.id, hold_token: refreshedHold.hold_token || null };
        }
      }

      const res = await storeApi.initiatePurchase(username, selectedProduct.id, {
        buyer_email: buyer.email,
        buyer_name: buyer.name || undefined,
        buyer_phone: buyer.phone || undefined,
        delivery_address: selectedProduct.type === 'physical' ? { address: buyer.address } : undefined,
        hold_booking_id: selectedProduct.type === 'service' ? holdPayload?.id : undefined,
        hold_token: selectedProduct.type === 'service' ? holdPayload?.hold_token || undefined : undefined,
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

  const proceedFromStepOne = () => {
    if (!buyer.email) {
      setError('Email is required');
      return;
    }
    setError(null);
    setCheckoutStep(2);
  };

  const proceedFromStepTwo = () => {
    if (!selectedProduct) return;
    if (selectedProduct.type === 'service' && !selectedSlot) {
      setError('Select a time slot');
      return;
    }
    if (selectedProduct.type === 'physical' && !buyer.address.trim()) {
      setError('Delivery address is required');
      return;
    }
    setError(null);
    setCheckoutStep(3);
  };

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

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-colors ${
                      checkoutStep >= step ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                ))}
              </div>

              {checkoutStep === 1 && (
                <>
                  <p className="text-sm text-text-secondary">Step 1: Buyer details</p>
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
                </>
              )}

              {checkoutStep === 2 && selectedProduct.type === 'physical' && (
                <Textarea
                  label="Delivery address"
                  value={buyer.address}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              )}

              {checkoutStep === 2 && selectedProduct.type === 'service' && (
                <div className="space-y-3">
                  <Textarea
                    label="Booking notes (optional)"
                    value={buyer.notes}
                    onChange={(e) => setBuyer((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-white/90">Select a day, then pick a time</p>
                    {slotsLoading ? (
                      <p className="text-sm text-white/85">Loading available slots...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-white/85">No slots available right now.</p>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-border bg-card/40 p-3">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleMonth(
                                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                              )
                            }
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/20 text-white/85 hover:text-white"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <p className="text-sm font-semibold text-white">
                            {visibleMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleMonth(
                                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                              )
                            }
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/20 text-white/85 hover:text-white"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-[11px] text-white/80">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center py-1">{day}</div>
                          ))}
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
                                className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                                  !cell.inMonth
                                    ? 'border-transparent text-white/35'
                                    : hasAvailability
                                      ? isSelected
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-background text-white hover:border-primary/60'
                                      : 'border-border/40 text-white/55 cursor-not-allowed'
                                }`}
                              >
                                {cell.date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-white/85">
                            {selectedDayKey
                              ? `Available times for ${new Date(`${selectedDayKey}T00:00:00`).toLocaleDateString()}`
                              : 'Select an available day'}
                          </p>
                          {selectedDayKey && selectedDaySlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {selectedDaySlots.map((slot) => {
                                const isActive = selectedSlot?.start === slot.start;
                                return (
                                  <button
                                    key={slot.start}
                                    type="button"
                                    onClick={() => handleSelectSlot(slot)}
                                    className={`px-3 py-2 rounded-lg border text-sm ${
                                      isActive
                                        ? 'border-primary bg-primary/20 text-white'
                                        : 'border-border text-white/85 hover:text-white'
                                    }`}
                                  >
                                    {new Date(slot.start).toLocaleTimeString([], {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-white/75">No times available for this day.</p>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedSlot && (
                      <p className={`text-xs flex items-center gap-1 ${holdSecondsLeft > 0 ? 'text-green-400' : 'text-amber-400'}`}>
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

              {checkoutStep === 2 && selectedProduct.type === 'digital' && (
                <div className="rounded-xl border border-border bg-card/40 p-4 text-sm text-text-secondary">
                  No extra details needed for digital products. Continue to review.
                </div>
              )}

              {checkoutStep === 3 && (
                <div className="rounded-xl border border-border bg-card/40 p-4 space-y-2 text-sm">
                  <p><span className="text-text-secondary">Product:</span> <span className="text-foreground font-medium">{selectedProduct.title}</span></p>
                  <p><span className="text-text-secondary">Buyer:</span> <span className="text-foreground">{buyer.email}</span></p>
                  {selectedProduct.type === 'service' && selectedSlot && (
                    <p><span className="text-text-secondary">Slot:</span> <span className="text-foreground">{new Date(selectedSlot.start).toLocaleString()}</span></p>
                  )}
                  {selectedProduct.type === 'physical' && buyer.address && (
                    <p><span className="text-text-secondary">Address:</span> <span className="text-foreground">{buyer.address}</span></p>
                  )}
                  <p className="pt-2 border-t border-border"><span className="text-text-secondary">Amount:</span> <span className="text-foreground font-semibold">₦{selectedProduct.price.toLocaleString()}</span></p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {checkoutStep > 1 && (
                  <Button variant="outline" onClick={() => setCheckoutStep((prev) => (prev - 1) as 1 | 2 | 3)}>
                    Back
                  </Button>
                )}
                {checkoutStep === 1 && (
                  <Button onClick={proceedFromStepOne} className="sm:ml-auto">
                    Continue
                  </Button>
                )}
                {checkoutStep === 2 && (
                  <Button onClick={proceedFromStepTwo} className="sm:ml-auto">
                    Review
                  </Button>
                )}
                {checkoutStep === 3 && (
                  <Button onClick={handleCheckout} disabled={checkoutLoading} className="sm:ml-auto">
                    {checkoutLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Proceed to payment
                  </Button>
                )}
              </div>

              {redirectInfo && (
                <div className="mt-3 p-3 rounded-lg bg-muted border border-border text-sm text-text-secondary">
                  <p className="font-medium text-foreground mb-1">Redirecting to payment…</p>
                  <div className="mt-2 rounded-lg border-2 border-red-500 bg-red-500/15 p-3">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-red-200">
                      Warning: Do not exit this checkout flow.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-red-100">
                      Even after successful payment, stay in this flow until you are redirected back to Linkverse.
                    </p>
                  </div>
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
