'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Loader2, Upload, Package, Calendar, ShoppingBag } from 'lucide-react';
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

  const displayName = useMemo(() => user?.username || 'creator', [user]);

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
          {products.length === 0 ? (
            <p className="text-text-secondary text-sm">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
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
              <div key={window.id} className="text-sm text-text-secondary">
                {weekdays.find((d) => d.value === window.weekday)?.label} • {window.start_time} - {window.end_time} ({window.timezone})
              </div>
            ))}
          </div>
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
            {orders.length === 0 ? (
              <p className="text-text-secondary text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.product?.title || 'Product'}</p>
                      <p className="text-xs text-text-secondary">{order.buyer_email}</p>
                      <p className="text-xs text-text-secondary">
                        ₦{order.amount.toLocaleString()} • {order.status}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-text-secondary">{order.reference}</span>
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
            {bookings.length === 0 ? (
              <p className="text-text-secondary text-sm">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {booking.buyer_email || 'Pending buyer'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(booking.slot_start).toLocaleString()} • {booking.status}
                      </p>
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
    </div>
  );
}
