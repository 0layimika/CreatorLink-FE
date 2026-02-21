'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Loader2, Upload, Package, Calendar, ShoppingBag, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { mediaApi, storeApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { StoreProduct, StoreOrder, ServiceBooking, ServiceAvailabilityWindow, StoreProductType } from '@/types';

const defaultProduct = {
  type: 'digital' as StoreProductType,
  title: '',
  description: '',
  price: 0,
  currency: 'NGN',
  cover_url: '',
  file_url: '',
  file_id: '',
  file_type: '',
  file_size: undefined as number | undefined,
  download_limit: 3,
  duration_minutes: 30,
  buffer_minutes: 0,
  timezone: 'Africa/Lagos',
  requires_address: false,
};

const weekdays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const dayKeyFromIso = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function StoreDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [availability, setAvailability] = useState<ServiceAvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [productForm, setProductForm] = useState(defaultProduct);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ordersOffset, setOrdersOffset] = useState(0);
  const [bookingsOffset, setBookingsOffset] = useState(0);
  const pageSize = 10;
  const [availabilityForm, setAvailabilityForm] = useState({
    weekday: 1,
    start_time: '',
    end_time: '',
    timezone: 'Africa/Lagos',
  });
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productFilter, setProductFilter] = useState<'all' | 'digital' | 'physical' | 'service'>('all');
  const [productQuery, setProductQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'>('all');
  const [orderQuery, setOrderQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'hold' | 'confirmed' | 'expired' | 'cancelled'>('all');
  const [bookingQuery, setBookingQuery] = useState('');
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<number | null>(null);
  const [editingAvailabilityForm, setEditingAvailabilityForm] = useState({
    weekday: 1,
    start_time: '',
    end_time: '',
    timezone: 'Africa/Lagos',
  });
  const [ownerBlockServiceId, setOwnerBlockServiceId] = useState<number | null>(null);
  const [ownerBlockSlots, setOwnerBlockSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [ownerBlockMonth, setOwnerBlockMonth] = useState<Date>(new Date());
  const [ownerBlockSelectedDay, setOwnerBlockSelectedDay] = useState<string | null>(null);
  const [ownerBlockSelectedSlot, setOwnerBlockSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [ownerBlockLoading, setOwnerBlockLoading] = useState(false);
  const [timelineItem, setTimelineItem] = useState<{ type: 'order' | 'booking'; payload: StoreOrder | ServiceBooking } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes, bookingsRes, availabilityRes] = await Promise.all([
        storeApi.listMyProducts({ limit: 50, offset: 0 }),
        storeApi.listOrders({ limit: pageSize, offset: 0 }),
        storeApi.listBookings({ limit: pageSize, offset: 0 }),
        storeApi.listAvailability(),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data as StoreProduct[]);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data as StoreOrder[]);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data as ServiceBooking[]);
      }
      if (availabilityRes.success && availabilityRes.data) {
        setAvailability(availabilityRes.data as ServiceAvailabilityWindow[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!ownerBlockServiceId) return;
    fetchOwnerSlots(ownerBlockServiceId).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerBlockServiceId, ownerBlockMonth]);

  const handleCoverUpload = async (file: File) => {
    const response = await mediaApi.upload(file);
    if (response.success && response.data?.url) {
      setProductForm((prev) => ({ ...prev, cover_url: response.data!.url }));
    } else {
      throw new Error('Failed to upload cover');
    }
  };

  const handleFileUpload = async (file: File) => {
    const response = await mediaApi.upload(file);
    if (response.success && response.data?.url) {
      setProductForm((prev) => ({
        ...prev,
        file_url: response.data!.url,
        file_id: response.data!.fileId,
        file_type: response.data!.fileType || '',
        file_size: response.data!.size,
      }));
    } else {
      throw new Error('Failed to upload file');
    }
  };

  const handleCreateProduct = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      if (!productForm.title || productForm.price <= 0) {
        throw new Error('Title and price are required');
      }
      if (productForm.type === 'digital' && !productForm.file_url) {
        throw new Error('Digital products require a file');
      }
      if (productForm.type === 'service' && !productForm.duration_minutes) {
        throw new Error('Services require a duration');
      }

      const response = await storeApi.createProduct({
        type: productForm.type,
        title: productForm.title,
        description: productForm.description || null,
        price: productForm.price,
        currency: productForm.currency,
        cover_url: productForm.cover_url || null,
        download_limit: productForm.type === 'digital' ? (productForm.download_limit || 3) : undefined,
        file_id: productForm.file_id || null,
        file_url: productForm.file_url || null,
        file_type: productForm.file_type || null,
        file_size: productForm.file_size ?? null,
        duration_minutes: productForm.type === 'service' ? productForm.duration_minutes : null,
        buffer_minutes: productForm.type === 'service' ? productForm.buffer_minutes : null,
        timezone: productForm.type === 'service' ? productForm.timezone : null,
        requires_address: productForm.type === 'physical' ? productForm.requires_address : false,
      });

      if (response.success) {
        setSuccess('Product created successfully');
        setProductForm(defaultProduct);
        fetchAll();
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProduct = async (product: StoreProduct) => {
    try {
      await storeApi.updateProduct(product.id, { is_active: !product.is_active });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const loadMoreOrders = async () => {
    const nextOffset = ordersOffset + pageSize;
    const res = await storeApi.listOrders({ limit: pageSize, offset: nextOffset });
    if (res.success && res.data) {
      setOrders((prev) => [...prev, ...(res.data as StoreOrder[])]);
      setOrdersOffset(nextOffset);
    }
  };

  const loadMoreBookings = async () => {
    const nextOffset = bookingsOffset + pageSize;
    const res = await storeApi.listBookings({ limit: pageSize, offset: nextOffset });
    if (res.success && res.data) {
      setBookings((prev) => [...prev, ...(res.data as ServiceBooking[])]);
      setBookingsOffset(nextOffset);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: 'cancelled' | 'refunded') => {
    try {
      const res = await storeApi.updateOrderStatus(orderId, status);
      if (!res.success) throw new Error(res.message || 'Failed to update order status');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      addToast('Order status updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update order status', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: 'confirmed' | 'cancelled' | 'expired') => {
    try {
      const res = await storeApi.updateBookingStatus(bookingId, status);
      if (!res.success) throw new Error(res.message || 'Failed to update booking status');
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      addToast('Booking status updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update booking status', 'error');
    }
  };

  const startEditAvailability = (window: ServiceAvailabilityWindow) => {
    setEditingAvailabilityId(window.id);
    setEditingAvailabilityForm({
      weekday: window.weekday,
      start_time: window.start_time,
      end_time: window.end_time,
      timezone: window.timezone,
    });
  };

  const saveEditAvailability = async () => {
    if (!editingAvailabilityId) return;
    try {
      const res = await storeApi.updateAvailability(editingAvailabilityId, editingAvailabilityForm);
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to update availability');
      setAvailability((prev) =>
        prev.map((w) => (w.id === editingAvailabilityId ? (res.data as ServiceAvailabilityWindow) : w))
      );
      setEditingAvailabilityId(null);
      addToast('Availability updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update availability', 'error');
    }
  };

  const deleteAvailability = async (id: number) => {
    try {
      const res = await storeApi.deleteAvailability(id);
      if (!res.success) throw new Error(res.message || 'Failed to delete availability');
      setAvailability((prev) => prev.filter((w) => w.id !== id));
      addToast('Availability deleted', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete availability', 'error');
    }
  };

  const blockSelectedTime = async () => {
    if (!ownerBlockServiceId || !ownerBlockSelectedSlot) {
      addToast('Select a service and time to block', 'error');
      return;
    }
    try {
      setOwnerBlockLoading(true);
      const res = await storeApi.blockServiceSlot({
        service_id: ownerBlockServiceId,
        slot_start: ownerBlockSelectedSlot.start,
        slot_end: ownerBlockSelectedSlot.end,
        notes: 'owner_block',
      });
      if (!res.success) throw new Error(res.message || 'Failed to block time');
      addToast('Time blocked successfully', 'success');
      await fetchOwnerSlots(ownerBlockServiceId);
      await fetchAll();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to block time', 'error');
    } finally {
      setOwnerBlockLoading(false);
    }
  };

  const displayName = useMemo(() => user?.username || 'creator', [user]);
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesType = productFilter === 'all' ? true : p.type === productFilter;
      const q = productQuery.trim().toLowerCase();
      const matchesQuery = q.length === 0
        ? true
        : p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [products, productFilter, productQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === 'all' ? true : o.status === orderStatusFilter;
      const q = orderQuery.trim().toLowerCase();
      const matchesQuery = q.length === 0
        ? true
        : (o.buyer_email || '').toLowerCase().includes(q) ||
          (o.product?.title || '').toLowerCase().includes(q) ||
          (o.reference || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, orderStatusFilter, orderQuery]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = bookingStatusFilter === 'all' ? true : b.status === bookingStatusFilter;
      const q = bookingQuery.trim().toLowerCase();
      const matchesQuery = q.length === 0
        ? true
        : (b.buyer_email || '').toLowerCase().includes(q) ||
          new Date(b.slot_start).toLocaleString().toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, bookingStatusFilter, bookingQuery]);

  const serviceProducts = useMemo(
    () => products.filter((p) => p.type === 'service'),
    [products]
  );

  useEffect(() => {
    if (!ownerBlockServiceId && serviceProducts.length > 0) {
      setOwnerBlockServiceId(serviceProducts[0].id);
    }
  }, [ownerBlockServiceId, serviceProducts]);

  const ownerBlockSlotsByDay = useMemo(() => {
    const grouped = new Map<string, Array<{ start: string; end: string }>>();
    ownerBlockSlots.forEach((slot) => {
      const key = dayKeyFromIso(slot.start);
      const current = grouped.get(key) || [];
      current.push(slot);
      grouped.set(key, current);
    });
    return grouped;
  }, [ownerBlockSlots]);

  const ownerBlockAvailableDays = useMemo(
    () => Array.from(ownerBlockSlotsByDay.keys()).sort(),
    [ownerBlockSlotsByDay]
  );

  const ownerBlockTimesForDay = useMemo(() => {
    if (!ownerBlockSelectedDay) return [];
    const daySlots = ownerBlockSlotsByDay.get(ownerBlockSelectedDay) || [];
    return [...daySlots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [ownerBlockSelectedDay, ownerBlockSlotsByDay]);

  const ownerBlockMonthGrid = useMemo(() => {
    const year = ownerBlockMonth.getFullYear();
    const month = ownerBlockMonth.getMonth();
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
  }, [ownerBlockMonth]);

  const fetchOwnerSlots = async (serviceId: number, monthDate?: Date) => {
    const currentMonth = monthDate || ownerBlockMonth;
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
    const res = await storeApi.listOwnerServiceSlots(serviceId, {
      from: monthStart.toISOString(),
      to: monthEnd.toISOString(),
    });
    if (res.success && res.data) {
      const slots = ((res.data as any).slots || []) as Array<{ start: string; end: string }>;
      setOwnerBlockSlots(slots);
      setOwnerBlockSelectedSlot(null);
      if (slots.length > 0) {
        setOwnerBlockSelectedDay(dayKeyFromIso(slots[0].start));
      } else {
        setOwnerBlockSelectedDay(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="md:hidden p-3 rounded-lg bg-muted border border-border text-text-secondary text-sm">
        Please open this section on a laptop for the best experience.
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Store</h1>
        <p className="text-text-secondary mt-1">
          Manage products, services, and bookings for @{displayName}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
          {success}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeTab === 'products' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('products')}
        >
          Products
        </Button>
        <Button
          type="button"
          variant={activeTab === 'orders' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('orders')}
        >
          Orders & Bookings
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-xs text-text-secondary">Products</p>
          <p className="text-xl font-semibold text-foreground">{products.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-xs text-text-secondary">Active Products</p>
          <p className="text-xl font-semibold text-foreground">{products.filter((p) => p.is_active).length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-xs text-text-secondary">Orders</p>
          <p className="text-xl font-semibold text-foreground">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="text-xs text-text-secondary">Bookings</p>
          <p className="text-xl font-semibold text-foreground">{bookings.length}</p>
        </div>
      </div>

      {activeTab === 'products' && (
      <>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Product or Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block text-text-secondary mb-1">Type</span>
              <select
                value={productForm.type}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, type: e.target.value as StoreProductType }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="digital">Digital product</option>
                <option value="physical">Physical product</option>
                <option value="service">Service (booking)</option>
              </select>
            </label>
            <Input
              label="Title"
              value={productForm.title}
              onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Product or service name"
            />
          </div>
          <Textarea
            label="Description"
            value={productForm.description || ''}
            onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what buyers get"
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (NGN)"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
            />
            <Input
              label="Currency"
              value={productForm.currency}
              onChange={(e) => setProductForm((prev) => ({ ...prev, currency: e.target.value }))}
            />
            {productForm.type === 'service' && (
              <Input
                label="Duration (minutes)"
                type="number"
                value={productForm.duration_minutes || 30}
                onChange={(e) => setProductForm((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              />
            )}
          </div>

          {productForm.type === 'service' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Buffer (minutes)"
                type="number"
                value={productForm.buffer_minutes || 0}
                onChange={(e) => setProductForm((prev) => ({ ...prev, buffer_minutes: Number(e.target.value) }))}
              />
              <Input
                label="Timezone"
                value={productForm.timezone || 'Africa/Lagos'}
                onChange={(e) => setProductForm((prev) => ({ ...prev, timezone: e.target.value }))}
              />
            </div>
          )}

          {productForm.type === 'digital' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Download limit"
                type="number"
                value={productForm.download_limit || 3}
                onChange={(e) => setProductForm((prev) => ({ ...prev, download_limit: Number(e.target.value) }))}
              />
            </div>
          )}

          {productForm.type === 'physical' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={productForm.requires_address}
                onChange={(e) => setProductForm((prev) => ({ ...prev, requires_address: e.target.checked }))}
              />
              <span>Require delivery address from buyer</span>
            </label>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-2">Cover image</p>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    await handleCoverUpload(file);
                  } catch (err) {
                    addToast(err instanceof Error ? err.message : 'Failed to upload cover', 'error');
                  }
                  e.target.value = '';
                }}
              />
              <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {productForm.cover_url ? 'Change cover' : 'Upload cover'}
              </Button>
              {productForm.cover_url && (
                <div className="mt-3 w-full max-w-[220px] rounded-lg overflow-hidden border border-border">
                  <img
                    src={productForm.cover_url}
                    alt="Cover preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            {productForm.type === 'digital' && (
              <div>
                <p className="text-sm text-text-secondary mb-2">Digital file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    await handleFileUpload(file);
                  } catch (err) {
                    addToast(err instanceof Error ? err.message : 'Failed to upload file', 'error');
                  }
                  e.target.value = '';
                }}
              />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {productForm.file_url ? 'Change file' : 'Upload file'}
                </Button>
                {productForm.file_url && (
                  <p className="text-xs text-text-secondary mt-2 truncate">
                    {productForm.file_url}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button onClick={handleCreateProduct} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Create
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Products & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                className="pl-9"
                placeholder="Search products"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as typeof productFilter)}
            >
              <option value="all">All types</option>
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="service">Service</option>
            </select>
          </div>
          {filteredProducts.length === 0 ? (
            <p className="text-text-secondary text-sm">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    {product.cover_url && (
                      <img
                        src={product.cover_url}
                        alt={product.title}
                        className="h-10 w-10 rounded-md object-cover border border-border"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-text-secondary">
                        {product.type} • ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${product.is_active ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
                    {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <Button
                    size="sm"
                    variant={product.is_active ? 'outline' : 'primary'}
                    onClick={() => handleToggleProduct(product)}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Availability Windows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={availabilityForm.weekday}
              onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, weekday: Number(e.target.value) }))}
            >
              {weekdays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            <Input
              label="Start"
              type="time"
              value={availabilityForm.start_time}
              onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, start_time: e.target.value }))}
            />
            <Input
              label="End"
              type="time"
              value={availabilityForm.end_time}
              onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, end_time: e.target.value }))}
            />
            <Input
              label="Timezone"
              value={availabilityForm.timezone}
              onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, timezone: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            onClick={async () => {
              try {
                const res = await storeApi.createAvailability({
                  weekday: availabilityForm.weekday,
                  start_time: availabilityForm.start_time,
                  end_time: availabilityForm.end_time,
                  timezone: availabilityForm.timezone,
                });
                if (res.success && res.data) {
                  setAvailability((prev) => [...prev, res.data as ServiceAvailabilityWindow]);
                  setAvailabilityForm((prev) => ({
                    ...prev,
                    start_time: '',
                    end_time: '',
                  }));
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to add availability');
              }
            }}
          >
            Add Window
          </Button>
          <div className="space-y-2">
            {availability.map((window) => (
              <div key={window.id} className="rounded-lg border border-border p-3 text-sm text-text-secondary">
                {editingAvailabilityId === window.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <select
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      value={editingAvailabilityForm.weekday}
                      onChange={(e) => setEditingAvailabilityForm((prev) => ({ ...prev, weekday: Number(e.target.value) }))}
                    >
                      {weekdays.map((day) => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                    <Input
                      type="time"
                      value={editingAvailabilityForm.start_time}
                      onChange={(e) => setEditingAvailabilityForm((prev) => ({ ...prev, start_time: e.target.value }))}
                    />
                    <Input
                      type="time"
                      value={editingAvailabilityForm.end_time}
                      onChange={(e) => setEditingAvailabilityForm((prev) => ({ ...prev, end_time: e.target.value }))}
                    />
                    <Input
                      value={editingAvailabilityForm.timezone}
                      onChange={(e) => setEditingAvailabilityForm((prev) => ({ ...prev, timezone: e.target.value }))}
                    />
                    <div className="sm:col-span-4 flex gap-2">
                      <Button size="sm" onClick={saveEditAvailability}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingAvailabilityId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {weekdays.find((d) => d.value === window.weekday)?.label} • {window.start_time} - {window.end_time} ({window.timezone})
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditAvailability(window)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteAvailability(window.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Block Time (Owner)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {serviceProducts.length === 0 ? (
            <p className="text-sm text-white/85">Create at least one service product to block times.</p>
          ) : (
            <>
              <label className="text-sm block">
                <span className="block text-white/90 mb-1">Service</span>
                <select
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  value={ownerBlockServiceId || ''}
                  onChange={(e) => setOwnerBlockServiceId(Number(e.target.value))}
                >
                  {serviceProducts.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-3 rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOwnerBlockMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/20 text-white/85 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-semibold text-white">
                    {ownerBlockMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOwnerBlockMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/20 text-white/85 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[20.5rem] space-y-1">
                    <div className="grid grid-cols-7 gap-1 text-[11px] text-white/80">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center py-1">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {ownerBlockMonthGrid.map((cell) => {
                        const available = ownerBlockAvailableDays.includes(cell.key);
                        const selected = ownerBlockSelectedDay === cell.key;
                        return (
                          <button
                            key={`${cell.key}-${cell.inMonth ? 'm' : 'o'}`}
                            type="button"
                            disabled={!available}
                            onClick={() => {
                              setOwnerBlockSelectedDay(cell.key);
                              setOwnerBlockSelectedSlot(null);
                            }}
                            className={`h-10 rounded-lg border text-sm font-semibold ${
                              !cell.inMonth
                                ? 'border-transparent text-white/35'
                                : available
                                  ? selected
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
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-white/85">
                    {ownerBlockSelectedDay
                      ? `Available times for ${new Date(`${ownerBlockSelectedDay}T00:00:00`).toLocaleDateString()}`
                      : 'Select an available day'}
                  </p>
                  {ownerBlockSelectedDay && ownerBlockTimesForDay.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ownerBlockTimesForDay.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          onClick={() => setOwnerBlockSelectedSlot(slot)}
                          className={`px-3 py-2 rounded-lg border text-sm ${
                            ownerBlockSelectedSlot?.start === slot.start
                              ? 'border-primary bg-primary/20 text-white'
                              : 'border-border text-white/85 hover:text-white'
                          }`}
                        >
                          {new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/75">No available times for this day.</p>
                  )}
                </div>
              </div>

              <Button onClick={blockSelectedTime} disabled={ownerBlockLoading || !ownerBlockSelectedSlot}>
                {ownerBlockLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
                Block Selected Time
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {activeTab === 'orders' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  className="pl-9"
                  placeholder="Search buyer, product, reference"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {filteredOrders.length === 0 ? (
              <p className="text-text-secondary text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.product?.title || 'Product'}</p>
                      <p className="text-xs text-text-secondary">{order.buyer_email}</p>
                      <p className="text-xs text-text-secondary">
                        ₦{order.amount.toLocaleString()} •
                        <span className={`ml-1 px-1.5 py-0.5 rounded border ${
                          order.status === 'paid' ? 'border-emerald-500/40 text-emerald-300'
                            : order.status === 'pending' ? 'border-amber-500/40 text-amber-300'
                            : 'border-red-500/40 text-red-300'
                        }`}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-text-secondary">{order.reference}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTimelineItem({ type: 'order', payload: order })}
                      >
                        Timeline
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                      {order.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, 'refunded')}
                        >
                          Refund
                        </Button>
                      )}
                      {order.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const res = await storeApi.resendOrderEmail(order.id);
                              if (res.success) {
                                addToast('Order emails resent', 'success');
                              } else {
                                addToast(res.message || 'Failed to resend emails', 'error');
                              }
                            } catch (err) {
                              addToast(err instanceof Error ? err.message : 'Failed to resend emails', 'error');
                            }
                          }}
                        >
                          Resend Email
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {orders.length >= pageSize && (
              <Button variant="outline" size="sm" className="mt-3" onClick={loadMoreOrders}>
                Load more
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  className="pl-9"
                  placeholder="Search email or date"
                  value={bookingQuery}
                  onChange={(e) => setBookingQuery(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value as typeof bookingStatusFilter)}
              >
                <option value="all">All statuses</option>
                <option value="hold">Hold</option>
                <option value="confirmed">Confirmed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {filteredBookings.length === 0 ? (
              <p className="text-text-secondary text-sm">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {booking.buyer_email || 'Pending buyer'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(booking.slot_start).toLocaleString()} •
                        <span className={`ml-1 px-1.5 py-0.5 rounded border ${
                          booking.status === 'confirmed' ? 'border-emerald-500/40 text-emerald-300'
                            : booking.status === 'hold' ? 'border-amber-500/40 text-amber-300'
                            : 'border-red-500/40 text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTimelineItem({ type: 'booking', payload: booking })}
                      >
                        Timeline
                      </Button>
                      {booking.status === 'hold' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {bookings.length >= pageSize && (
              <Button variant="outline" size="sm" className="mt-3" onClick={loadMoreBookings}>
                Load more
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {timelineItem && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="w-full max-w-md h-full bg-background border-l border-border p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {timelineItem.type === 'order' ? 'Order Timeline' : 'Booking Timeline'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setTimelineItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {timelineItem.type === 'order' ? (
              <div className="space-y-3 text-sm">
                {(() => {
                  const order = timelineItem.payload as StoreOrder;
                  const events = [
                    { label: 'Order created', at: order.created_at },
                    { label: `Status: ${order.status}`, at: order.updated_at || order.created_at },
                  ];
                  return events.map((event, idx) => (
                    <div key={`${event.label}-${idx}`} className="rounded-lg border border-border p-3">
                      <p className="text-foreground font-medium">{event.label}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {event.at ? new Date(event.at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {(() => {
                  const booking = timelineItem.payload as ServiceBooking;
                  const events = [
                    { label: 'Booking created', at: booking.created_at },
                    { label: `Status: ${booking.status}`, at: booking.updated_at || booking.created_at },
                    { label: 'Slot start', at: booking.slot_start },
                    { label: 'Slot end', at: booking.slot_end },
                  ];
                  return events.map((event, idx) => (
                    <div key={`${event.label}-${idx}`} className="rounded-lg border border-border p-3">
                      <p className="text-foreground font-medium">{event.label}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {event.at ? new Date(event.at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
