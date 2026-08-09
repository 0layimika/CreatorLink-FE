'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Loader2, Upload, Package, ShoppingBag, Search, Pencil, Trash2, X, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { mediaApi, storeApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { StoreProduct, StoreOrder } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { DashboardLoading, DashboardPageHeader, MetricCard } from '@/components/dashboard/DashboardUI';

const defaultProduct = {
  title: '',
  description: '',
  price: 0,
  compare_at_price: undefined as number | undefined,
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
  requires_address: true,
  track_inventory: true,
  stock_quantity: 0,
};

export default function StoreDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsOffset, setProductsOffset] = useState(0);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productsLoadingMore, setProductsLoadingMore] = useState(false);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [productForm, setProductForm] = useState(defaultProduct);
  const [storeCurrency, setStoreCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [currencyDraft, setCurrencyDraft] = useState<'NGN' | 'USD'>('NGN');
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyConfirmOpen, setCurrencyConfirmOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<StoreProduct | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [ordersOffset, setOrdersOffset] = useState(0);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productQuery, setProductQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'paid' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'refunded' | 'cancelled' | 'expired'>('all');
  const [orderQuery, setOrderQuery] = useState('');
  const [timelineItem, setTimelineItem] = useState<{ type: 'order'; payload: StoreOrder } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        storeApi.listMyProducts({ limit: 12, offset: 0 }),
        storeApi.listOrders({ limit: pageSize, offset: 0 }),
      ]);

      if (productsRes.success && productsRes.data) {
        const loadedProducts = productsRes.data as StoreProduct[];
        setProducts(loadedProducts);
        if (loadedProducts[0]?.currency === 'USD' || loadedProducts[0]?.currency === 'NGN') setStoreCurrency(loadedProducts[0].currency);
        setProductsOffset((productsRes.data as StoreProduct[]).length);
        setProductsHasMore((productsRes.data as StoreProduct[]).length === 12);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data as StoreOrder[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (productsLoadingMore || !productsHasMore) return;
    setProductsLoadingMore(true);
    try {
      const response = await storeApi.listMyProducts({ limit: 12, offset: productsOffset });
      if (response.success && response.data) {
        const next = response.data as StoreProduct[];
        setProducts((prev) => [...prev, ...next]);
        setProductsOffset((prev) => prev + next.length);
        setProductsHasMore(next.length === 12);
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load more products', 'error');
    } finally {
      setProductsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => { void storeApi.getStoreCurrency().then((response) => { if (response.success && response.data) { setStoreCurrency(response.data.currency); setCurrencyDraft(response.data.currency); } }); }, []);

  const saveStoreCurrency = async () => {
    setIsSavingCurrency(true);
    try {
      const response = await storeApi.setStoreCurrency(currencyDraft);
      if (!response.success) throw new Error(response.message || 'Currency could not be changed');
      setStoreCurrency(currencyDraft);
      await fetchAll();
      addToast('Default store currency saved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Currency could not be changed', 'error');
    } finally { setIsSavingCurrency(false); }
  };

  const requestStoreCurrencyChange = () => {
    if (currencyDraft === storeCurrency) return;
    if (products.length) setCurrencyConfirmOpen(true); else void saveStoreCurrency();
  };

  const handleCoverUpload = async (file: File) => {
    const response = await mediaApi.upload(file);
    if (response.success && response.data?.url) {
      setProductForm((prev) => ({ ...prev, cover_url: response.data!.url }));
    } else {
      throw new Error('Failed to upload cover');
    }
  };

  const handleSaveProduct = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const minimumProductPrice = storeCurrency === 'USD' ? 1 : 1000;
      if (!productForm.title || productForm.price < minimumProductPrice) {
        throw new Error(`Title is required and minimum price is ${storeCurrency === 'USD' ? '$1' : '₦1,000'}`);
      }
      const numericDiscount = Number(discountValue || 0);
      const compareAtPrice = numericDiscount > 0
        ? discountType === 'percentage'
          ? Math.round(productForm.price / Math.max(0.01, 1 - Math.min(numericDiscount, 99) / 100))
          : Math.round(productForm.price + numericDiscount)
        : null;
      const payload = {
        type: 'physical' as const,
        title: productForm.title,
        description: productForm.description || null,
        price: Number(productForm.price),
        compare_at_price: compareAtPrice === null ? null : Number(compareAtPrice),
        currency: storeCurrency,
        cover_url: productForm.cover_url || null,
        // download_limit: productForm.type === 'digital' ? (productForm.download_limit || 3) : undefined,
        file_id: productForm.file_id || null,
        file_url: productForm.file_url || null,
        file_type: productForm.file_type || null,
        file_size: productForm.file_size ?? null,
        // duration_minutes: productForm.type === 'service' ? productForm.duration_minutes : null,
        // buffer_minutes: productForm.type === 'service' ? productForm.buffer_minutes : null,
        // timezone: productForm.type === 'service' ? productForm.timezone : null,
        requires_address: true,
        track_inventory: productForm.track_inventory,
        stock_quantity: productForm.stock_quantity === null || productForm.stock_quantity === undefined ? null : Number(productForm.stock_quantity),
      };

      if (editingProductId) {
        const response = await storeApi.updateProduct(editingProductId, payload);
        if (response.success) {
          setSuccess('Product updated successfully');
          setProductForm(defaultProduct);
          setEditingProductId(null);
          setProductModalOpen(false);
          fetchAll();
        } else {
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        const response = await storeApi.createProduct(payload);
        if (response.success) {
          setSuccess('Product created successfully');
          setProductForm(defaultProduct);
          setProductModalOpen(false);
          fetchAll();
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${editingProductId ? 'update' : 'create'} product`;
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: StoreProduct) => {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compare_at_price || undefined,
      currency: product.currency || 'NGN',
      cover_url: product.cover_url || '',
      file_url: product.file_url || '',
      file_id: product.file_id || '',
      file_type: product.file_type || '',
      file_size: product.file_size || undefined,
      download_limit: product.download_limit || 3,
      duration_minutes: product.duration_minutes || 30,
      buffer_minutes: product.buffer_minutes || 0,
      timezone: product.timezone || 'Africa/Lagos',
      requires_address: true,
      track_inventory: product.track_inventory ?? true,
      stock_quantity: product.stock_quantity || 0,
    });
    const discount = product.compare_at_price && product.compare_at_price > product.price
      ? (discountType === 'percentage'
        ? String(Math.round((1 - product.price / product.compare_at_price) * 100))
        : String(product.compare_at_price - product.price))
      : '';
    setDiscountValue(discount);
    setProductModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductForm(defaultProduct);
    setError(null);
    setSuccess(null);
    setProductModalOpen(false);
    setDiscountValue('');
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await storeApi.deleteProduct(id);
      if (response.success) {
        addToast('Product deleted successfully', 'success');
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
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

  const handleUpdateOrderStatus = async (orderId: number, status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded') => {
    try {
      const res = await storeApi.updateOrderStatus(orderId, status);
      if (!res.success) throw new Error(res.message || 'Failed to update order status');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      addToast('Order status updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update order status', 'error');
    }
  };

  const displayName = useMemo(() => user?.username || 'creator', [user]);
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesType = p.type === 'physical';
      const q = productQuery.trim().toLowerCase();
      const matchesQuery = q.length === 0
        ? true
        : p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [products, productQuery]);

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

  const orderStatusLabel = (status: StoreOrder['status']) => ({ pending: 'Awaiting payment', paid: 'Paid', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', failed: 'Payment failed', refunded: 'Refunded', cancelled: 'Cancelled', expired: 'Expired' }[status]);
  const fulfilmentIndex = (status: StoreOrder['status']) => ({ paid: 0, confirmed: 1, processing: 2, shipped: 2, delivered: 3 } as Record<string, number>)[status] ?? -1;

  if (loading) {
    return <DashboardLoading label="Opening your store…" />;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader eyebrow="Sell your work" title="Store" description={<>Manage products and orders for <strong className="text-foreground">@{displayName}</strong>.</>} />

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
          Orders
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Products" value={String(products.length)} icon={Package} tone="pink" />
        <MetricCard label="Active products" value={String(products.filter((product) => product.is_active).length)} icon={CircleCheck} tone="lime" />
        <MetricCard label="Orders" value={String(orders.length)} icon={ShoppingBag} tone="ink" />
      </div>

      {activeTab === 'products' && (
      <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div className="w-full"><h2 className="text-xl font-bold">Products</h2><p className="text-sm text-text-secondary">Physical products your audience can buy.</p><div className="mt-4 flex flex-wrap items-end gap-3"><div><label htmlFor="store-currency" className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">Default currency</label><select id="store-currency" value={currencyDraft} onChange={(event) => setCurrencyDraft(event.target.value as 'NGN' | 'USD')} className="mt-1 block rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold"><option value="NGN">NGN</option><option value="USD">USD</option></select></div><Button type="button" size="sm" onClick={requestStoreCurrencyChange} disabled={isSavingCurrency || currencyDraft === storeCurrency}>{isSavingCurrency ? 'Saving…' : 'Set as default'}</Button><p className="basis-full text-xs text-text-secondary">All new products and checkouts will use {storeCurrency}.</p></div></div>
        {currencyConfirmOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><Card className="w-full max-w-md p-6 shadow-2xl"><CardTitle>Change store currency?</CardTitle><p className="mt-3 text-sm leading-6 text-text-secondary">All {products.length} existing products will be set to {currencyDraft}, deactivated, and require updated prices before you can reactivate them.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setCurrencyConfirmOpen(false)}>Cancel</Button><Button onClick={() => { setCurrencyConfirmOpen(false); void saveStoreCurrency(); }}>Change currency</Button></div></Card></div>}
        <Button className="shrink-0 sm:mt-1" onClick={() => { setEditingProductId(null); setProductForm(defaultProduct); setDiscountValue(''); setProductModalOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create product</Button>
      </div>
      {productModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelEdit} /><Card className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingProductId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingProductId ? 'Edit Product' : 'Create Product'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={productForm.title}
              onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Product name"
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
              label={`Price (${storeCurrency})`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={productForm.price || ''}
              min={storeCurrency === 'USD' ? '1' : '1000'}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value.replace(/\D/g, '')) || 0 }))}
            />
            <div className="grid grid-cols-2 gap-2"><Select label="Discount" value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')} options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Amount', value: 'amount' }]} /><Input label={discountType === 'percentage' ? 'Discount (%)' : `Discount (${storeCurrency})`} type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="Optional" /></div>
            {products.length === 0 && !editingProductId ? (
              <Select label="Store currency" value={storeCurrency} onChange={(e) => { const next = e.target.value as 'NGN' | 'USD'; setStoreCurrency(next); setProductForm((prev) => ({ ...prev, currency: next })); }} options={[{ label: 'NGN', value: 'NGN' }, { label: 'USD', value: 'USD' }]} />
            ) : <Input label="Store currency" value={storeCurrency} readOnly />}
            {/* {productForm.type === 'service' && (
              <Input
                label="Duration (minutes)"
                type="number"
                value={productForm.duration_minutes || 30}
                onChange={(e) => setProductForm((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              />
            )} */}
          </div>

          {/* {productForm.type === 'service' && (
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
          )} */}

          {/* {productForm.type === 'digital' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Download limit"
                type="number"
                value={productForm.download_limit || 3}
                onChange={(e) => setProductForm((prev) => ({ ...prev, download_limit: Number(e.target.value) }))}
              />
            </div>
          )} */}

          <div className="space-y-3">
              <Input
                label="Available Quantity"
                type="number"
                value={productForm.stock_quantity ?? 0}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock_quantity: Math.max(0, Number(e.target.value || 0)) }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.track_inventory}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, track_inventory: e.target.checked }))}
                />
                <span>Track inventory for this product</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.requires_address}
                  disabled
                  onChange={() => undefined}
                />
                <span>Require delivery address from buyer <span className="text-xs text-text-secondary">(required for physical products)</span></span>
              </label>
          </div>

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

            {/* {productForm.type === 'digital' && (
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
            )} */}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveProduct} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : editingProductId ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {editingProductId ? 'Save Changes' : 'Create'}
            </Button>
            {editingProductId && (
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card></div>}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Products
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
          </div>
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/50 px-6 py-14 text-center"><Package className="mx-auto h-10 w-10 text-text-secondary" /><h3 className="mt-3 text-lg font-semibold">Your store is waiting for its first drop</h3><p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">Add a physical product and give your audience something lovely to buy.</p><Button className="mt-5" onClick={() => { setEditingProductId(null); setProductForm(defaultProduct); setDiscountValue(''); setProductModalOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create product</Button></div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group overflow-hidden rounded-2xl border border-border bg-card/60">
                  <div className="aspect-[16/10] bg-background">
                    {product.cover_url && (
                      <img
                        src={product.cover_url}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-text-secondary">
                        {formatCurrency(product.price, product.currency || 'NGN')} • Stock: {product.stock_quantity ?? 0}
                        {product.compare_at_price && product.compare_at_price > product.price ? ` • ${Math.round((1 - product.price / product.compare_at_price) * 100)}% off` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-70 group-hover:opacity-100"><button aria-label={`Edit ${product.title}`} className="rounded-lg p-2 hover:bg-primary/10" onClick={() => handleEditProduct(product)}><Pencil className="h-4 w-4" /></button><button aria-label={`Delete ${product.title}`} className="rounded-lg p-2 text-error hover:bg-error/10" onClick={() => setDeleteProductTarget(product)}><Trash2 className="h-4 w-4" /></button></div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant={product.is_active ? 'outline' : 'primary'}
                      className={product.is_active ? 'border-error text-error hover:bg-error/10' : ''}
                      onClick={() => handleToggleProduct(product)}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {productsHasMore && filteredProducts.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={loadMoreProducts} disabled={productsLoadingMore}>
                {productsLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load more products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {deleteProductTarget && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteProductTarget(null)} /><Card className="relative z-10 w-full max-w-md shadow-2xl"><CardContent className="p-6"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-error/10 text-error"><Trash2 className="h-5 w-5" /></div><h2 className="mt-4 text-xl font-bold">Delete “{deleteProductTarget.title}”?</h2><p className="mt-2 text-sm text-text-secondary">This removes the product from your store. Existing paid orders will remain in your order history.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteProductTarget(null)}>Keep product</Button><Button className="bg-error text-white hover:bg-error/90" onClick={async () => { const target = deleteProductTarget; setDeleteProductTarget(null); await handleDeleteProduct(target.id); }}>Delete product</Button></div></CardContent></Card></div>}

      {/* <Card className="shadow-soft">
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
      */}
      </>
      )}

      {activeTab === 'orders' && (
      <div className="grid grid-cols-1 gap-6">
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
              <Select
                className="sm:w-52"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                options={[
                  { label: 'All statuses', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Paid', value: 'paid' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Shipped', value: 'shipped' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Failed', value: 'failed' },
                  { label: 'Refunded', value: 'refunded' },
                  { label: 'Cancelled', value: 'cancelled' },
                  { label: 'Expired', value: 'expired' },
                ]}
              />
            </div>
            {filteredOrders.length === 0 ? (
              <p className="text-text-secondary text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border bg-card/60 p-4 shadow-soft">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-base font-bold text-foreground">{order.product?.title || 'Product'}</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${['paid', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-emerald-500/15 text-emerald-700' : order.status === 'pending' ? 'bg-amber-500/15 text-amber-700' : 'bg-error/10 text-error'}`}>{orderStatusLabel(order.status)}</span></div>
                      <p className="mt-1 text-sm text-text-secondary">{order.buyer_name || 'Customer'} · {order.buyer_email}</p>
                      <p className="mt-2 text-lg font-black text-foreground">{formatCurrency(order.amount, order.currency || 'NGN')} <span className="text-xs font-normal text-text-secondary">· {order.item_count || 1} item{(order.item_count || 1) === 1 ? '' : 's'}</span></p>
                      <p className="mt-1 text-xs text-text-secondary">Order {order.reference} · {order.created_at ? new Date(order.created_at).toLocaleString() : 'Recent'}</p>
                      {fulfilmentIndex(order.status) >= 0 && <div className="mt-4 flex max-w-xl items-center gap-1">{['Paid', 'Confirmed', 'Processing', 'Delivered'].map((step, index) => <div key={step} className="flex flex-1 items-center gap-1"><div className={`h-1.5 flex-1 rounded-full ${index <= fulfilmentIndex(order.status) ? 'bg-primary' : 'bg-border'}`} /><span className={`hidden text-[10px] sm:block ${index <= fulfilmentIndex(order.status) ? 'text-foreground' : 'text-text-secondary'}`}>{step}</span></div>)}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
                        <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>Confirm order</Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'processing')}>Start processing</Button>
                      )}
                      {['processing', 'shipped'].includes(order.status) && (
                        <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>Mark delivered</Button>
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

        {/* <Card className="shadow-soft">
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
        </Card> */}
      </div>
      )}

      {timelineItem && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="w-full max-w-md h-full bg-background border-l border-border p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {timelineItem.type === 'order' ? 'Order Timeline' : 'Timeline'}
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
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
