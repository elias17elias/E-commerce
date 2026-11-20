import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardList,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';

const tabs = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'balance', label: 'Balance', icon: Users },
];

function AdminPanel({ token, onClose, onNotice }) {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '' });
  const [balanceForm, setBalanceForm] = useState({ userId: '', amount: '' });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [productResult, orderResult] = await Promise.all([
        api('/products?limit=100'),
        api('/orders?limit=100', { token }),
      ]);
      setProducts(productResult.data);
      setOrders(orderResult.data);
    } catch (error) {
      onNotice(error.message || 'Could not load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (expandedOrderId === null) return undefined;
    let active = true;
    setOrderDetailsLoading(true);
    setOrderDetailsError('');
    api(`/orders/${expandedOrderId}`, { token })
      .then((order) => {
        if (active) setExpandedOrder(order);
      })
      .catch((error) => {
        if (active) setOrderDetailsError(error.message || 'Order items could not be loaded.');
      })
      .finally(() => {
        if (active) setOrderDetailsLoading(false);
      });
    return () => { active = false; };
  }, [expandedOrderId, token]);

  const updateProductField = (field) => (event) => setProductForm((current) => ({ ...current, [field]: event.target.value }));

  const startEditing = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, price: String(product.price), stock: String(product.stock) });
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '' });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const body = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };
      const updated = await api(
        editingProduct ? `/products/${editingProduct.id}` : '/products',
        { token, method: editingProduct ? 'PUT' : 'POST', body },
      );
      setProducts((current) => editingProduct
        ? current.map((product) => product.id === updated.id ? updated : product)
        : [updated, ...current]);
      resetProductForm();
      onNotice(editingProduct ? 'Product updated.' : 'Product added to the collection.');
    } catch (error) {
      onNotice(error.message || 'Product could not be saved.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete “${product.name}”?`)) return;
    try {
      await api(`/products/${product.id}`, { token, method: 'DELETE' });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      onNotice('Product removed.');
    } catch (error) {
      onNotice(error.message || 'Product could not be deleted.', 'error');
    }
  };

  const updateOrder = async (order, status) => {
    setBusy(true);
    try {
      const updated = await api(`/orders/${order.id}`, { token, method: 'PUT', body: { status } });
      setOrders((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
      onNotice(`Order #${order.id} marked ${status}.`);
    } catch (error) {
      onNotice(error.message || 'Order status could not be updated.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((current) => current === orderId ? null : orderId);
    setExpandedOrder(null);
    setOrderDetailsError('');
  };

  const topUpBalance = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const updatedUser = await api(`/users/${balanceForm.userId}/balance`, {
        token,
        body: { amount: Number(balanceForm.amount) },
      });
      onNotice(`${updatedUser.name}’s balance is now ${formatMoney(updatedUser.balance)}.`);
      setBalanceForm({ userId: '', amount: '' });
    } catch (error) {
      onNotice(error.message || 'Balance could not be updated.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-0 backdrop-blur-sm sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-paper shadow-soft sm:max-h-[min(850px,94vh)] sm:rounded-[28px]" role="dialog" aria-modal="true" aria-labelledby="admin-title">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="eyebrow">Good Things Market</p>
            <h2 id="admin-title" className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em] text-ink">Admin studio</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadDashboard} aria-label="Refresh admin data" className="grid h-9 w-9 place-items-center rounded-full bg-paper text-muted hover:text-forest"><RefreshCw size={15} /></button>
            <button onClick={onClose} aria-label="Close admin studio" className="grid h-9 w-9 place-items-center rounded-full bg-paper text-muted hover:text-ink"><X size={17} /></button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-white p-3 sm:w-[190px] sm:flex-col sm:border-b-0 sm:border-r sm:p-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs font-bold transition sm:w-full ${tab === id ? 'bg-forest text-white' : 'text-muted hover:bg-paper hover:text-ink'}`}>
                <Icon size={16} />{label}
              </button>
            ))}
            <div className="mt-auto hidden rounded-2xl bg-paper p-4 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Quick overview</p>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">{products.length}</p>
              <p className="text-xs text-muted">products shown</p>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">{orders.length}</p>
              <p className="text-xs text-muted">orders shown</p>
            </div>
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
            {loading ? (
              <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-forest" size={26} /></div>
            ) : tab === 'products' ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <div className="mb-5 flex items-end justify-between">
                    <div><p className="eyebrow">Your catalog</p><h3 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">Products</h3></div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-muted">{products.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {products.length === 0 && <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No products yet. Add the first one.</p>}
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lime/50 text-xl">✳</div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{product.name}</p><p className="mt-0.5 text-xs text-muted">{formatMoney(product.price)} · {product.stock} in stock</p></div>
                        <button onClick={() => startEditing(product)} aria-label={`Edit ${product.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-paper hover:text-forest"><Pencil size={15} /></button>
                        <button onClick={() => removeProduct(product)} aria-label={`Delete ${product.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={saveProduct} className="h-fit rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div><p className="eyebrow">{editingProduct ? 'Keep it current' : 'Add a good thing'}</p><h4 className="mt-1 font-display text-lg font-extrabold text-ink">{editingProduct ? 'Edit product' : 'New product'}</h4></div>
                    {editingProduct ? <button type="button" onClick={resetProductForm} aria-label="Cancel editing" className="text-muted hover:text-ink"><X size={16} /></button> : <Plus size={18} className="text-forest" />}
                  </div>
                  <div className="mt-5 space-y-3">
                    <label className="field-label text-xs">Product name<input required maxLength={100} value={productForm.name} onChange={updateProductField('name')} className="field-input" placeholder="Everyday ceramic mug" /></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="field-label text-xs">Price<input required type="number" min="0.01" max="99999999.99" step="0.01" value={productForm.price} onChange={updateProductField('price')} className="field-input" placeholder="18.00" /></label>
                      <label className="field-label text-xs">Stock<input required type="number" min="0" max="2147483647" step="1" value={productForm.stock} onChange={updateProductField('stock')} className="field-input" placeholder="24" /></label>
                    </div>
                    <button disabled={busy} className="primary-button mt-2 w-full !py-3">
                      {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />}
                      {editingProduct ? 'Save changes' : 'Add product'}
                    </button>
                  </div>
                </form>
              </div>
            ) : tab === 'orders' ? (
              <div>
                <div className="mb-5 flex items-end justify-between">
                  <div><p className="eyebrow">What’s moving</p><h3 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">Orders</h3></div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-muted">{orders.length} shown · max 100</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  {orders.length === 0 ? <p className="p-8 text-center text-sm text-muted">No orders yet.</p> : (
                    <div className="divide-y divide-line">
                      {orders.map((order) => (
                        <div key={order.id} className="border-b border-line last:border-b-0">
                          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                            <button
                              type="button"
                              onClick={() => toggleOrderDetails(order.id)}
                              aria-expanded={expandedOrderId === order.id}
                              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 text-left"
                            >
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-forest"><ClipboardList size={17} /></span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-ink">Order #{order.id}</span>
                                <span className="mt-1 block text-xs text-muted">Customer {order.user_id} · {new Date(order.created_at).toLocaleDateString()}</span>
                              </span>
                              <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                            </button>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${order.status === 'completed' ? 'bg-green-50 text-green-700' : order.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{order.status}</span>
                            {order.status === 'pending' && (
                              <div className="flex items-center gap-1">
                                <button disabled={busy} onClick={() => updateOrder(order, 'completed')} className="rounded-full bg-forest px-3 py-2 text-[10px] font-bold text-white hover:bg-[#1d3b30] disabled:opacity-50">Complete</button>
                                <button disabled={busy} onClick={() => updateOrder(order, 'cancelled')} className="rounded-full border border-line px-3 py-2 text-[10px] font-bold text-muted hover:border-rose-200 hover:text-rose-700 disabled:opacity-50">Cancel</button>
                              </div>
                            )}
                          </div>
                          {expandedOrderId === order.id && (
                            <div className="border-t border-line bg-paper/60 px-4 py-3 sm:px-5">
                              {orderDetailsLoading ? (
                                <div className="flex items-center gap-2 py-3 text-xs font-medium text-muted">
                                  <LoaderCircle size={14} className="animate-spin text-forest" /> Loading order items
                                </div>
                              ) : orderDetailsError ? (
                                <p className="py-2 text-xs font-medium text-rose-700">{orderDetailsError}</p>
                              ) : expandedOrder ? (
                                expandedOrder.order_items.length === 0 ? (
                                  <p className="py-2 text-xs text-muted">This order has no items.</p>
                                ) : (
                                  <>
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Items in this order</p>
                                    <div className="divide-y divide-line">
                                      {expandedOrder.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-ink">{item.product_name || `Product #${item.product_id}`}</p>
                                            <p className="mt-1 text-[10px] text-muted">{item.quantity} × {formatMoney(item.price)}</p>
                                          </div>
                                          <span className="shrink-0 text-xs font-extrabold text-ink">{formatMoney(Number(item.price) * item.quantity)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-xl">
                <p className="eyebrow">A little store credit</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">Top up a balance.</h3>
                <p className="mt-2 text-sm leading-6 text-muted">Add funds to a customer's account. Balance changes are handled by the API.</p>
                <form onSubmit={topUpBalance} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
                  <label className="field-label">Customer ID<input required type="number" min="1" step="1" value={balanceForm.userId} onChange={(event) => setBalanceForm((current) => ({ ...current, userId: event.target.value }))} className="field-input" placeholder="e.g. 42" /></label>
                  <label className="field-label">Amount<input required type="number" min="0.01" max="9999999999.99" step="0.01" value={balanceForm.amount} onChange={(event) => setBalanceForm((current) => ({ ...current, amount: event.target.value }))} className="field-input" placeholder="50.00" /></label>
                  <button disabled={busy} className="primary-button w-full">
                    {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                    Add balance
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;
