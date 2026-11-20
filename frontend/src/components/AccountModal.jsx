import { useEffect, useState } from 'react';
import {
  ChevronDown,
  CreditCard,
  LoaderCircle,
  LogOut,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';

function AccountModal({ user, token, onClose, onLogout, onLogoutAll }) {
  const [busyAction, setBusyAction] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [ordersCursor, setOrdersCursor] = useState(null);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const result = await api(`/orders/user/${user.id}?limit=10`, { token });
      setOrders(result.data);
      setOrdersCursor(result.pagination.nextCursor);
      setHasMoreOrders(result.pagination.hasMore);
    } catch (error) {
      setOrdersError(error.message || 'Your orders could not be loaded.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api(`/orders/user/${user.id}?limit=10`, { token })
      .then((result) => {
        if (active) {
          setOrders(result.data);
          setOrdersCursor(result.pagination.nextCursor);
          setHasMoreOrders(result.pagination.hasMore);
        }
      })
      .catch((error) => {
        if (active) setOrdersError(error.message || 'Your orders could not be loaded.');
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [token, user.id]);

  useEffect(() => {
    if (selectedOrderId === null) return undefined;
    let active = true;
    setOrderDetailsLoading(true);
    setOrderDetailsError('');
    api(`/orders/${selectedOrderId}`, { token })
      .then((order) => {
        if (active) setSelectedOrder(order);
      })
      .catch((error) => {
        if (active) setOrderDetailsError(error.message || 'Order details could not be loaded.');
      })
      .finally(() => {
        if (active) setOrderDetailsLoading(false);
      });
    return () => { active = false; };
  }, [selectedOrderId, token]);

  const signOut = async (allDevices = false) => {
    setBusyAction(allDevices ? 'all' : 'current');
    try {
      await (allDevices ? onLogoutAll() : onLogout());
    } finally {
      setBusyAction(null);
      onClose();
    }
  };

  const loadMoreOrders = async () => {
    if (!ordersCursor || loadingMoreOrders) return;
    setLoadingMoreOrders(true);
    try {
      const params = new URLSearchParams({ limit: '10', cursor: ordersCursor });
      const result = await api(`/orders/user/${user.id}?${params}`, { token });
      setOrders((current) => [...current, ...result.data]);
      setOrdersCursor(result.pagination.nextCursor);
      setHasMoreOrders(result.pagination.hasMore);
    } catch (error) {
      setOrdersError(error.message || 'More orders could not be loaded.');
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  const toggleOrder = (orderId) => {
    setSelectedOrderId((current) => current === orderId ? null : orderId);
    setSelectedOrder(null);
    setOrderDetailsError('');
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-soft sm:p-8" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button onClick={onClose} aria-label="Close dialog" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-paper text-muted hover:text-ink">
          <X size={17} />
        </button>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-lime text-forest font-display text-xl font-extrabold">
          {user.name?.slice(0, 1).toUpperCase() || <UserRound size={22} />}
        </div>
        <p className="eyebrow mt-6">Your account</p>
        <h2 id="account-title" className="mt-1 font-display text-3xl font-extrabold tracking-[-0.05em] text-ink">{user.name}</h2>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-paper p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink"><CreditCard size={17} className="text-forest" /> Store balance</span>
          <span className="font-display text-lg font-extrabold text-forest">{formatMoney(user.balance)}</span>
        </div>

        <div className="mt-7 border-t border-line pt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your shopping, at a glance</p>
              <h3 className="mt-1 font-display text-xl font-extrabold tracking-[-0.04em] text-ink">Order history</h3>
            </div>
            {!ordersLoading && !ordersError && (
              <span className="rounded-full bg-paper px-3 py-1.5 text-[10px] font-bold text-muted">{orders.length}{hasMoreOrders ? '+' : ''} orders</span>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-paper py-8 text-xs font-semibold text-muted">
              <LoaderCircle size={16} className="animate-spin text-forest" /> Loading your orders
            </div>
          ) : ordersError ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-rose-800">{ordersError}</p>
              <button onClick={loadOrders} className="mt-3 text-xs font-bold text-forest hover:underline">Try again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-paper px-4 py-7 text-center">
              <PackageCheck size={22} className="mx-auto text-forest" />
              <p className="mt-2 text-sm font-semibold text-ink">No orders yet</p>
              <p className="mt-1 text-xs text-muted">Your next good find will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                return (
                  <div key={order.id} className="overflow-hidden rounded-2xl border border-line">
                    <button
                      type="button"
                      onClick={() => toggleOrder(order.id)}
                      aria-expanded={isSelected}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-paper/70"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime/50 text-forest"><ShoppingBag size={16} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">Order #{order.id}</span>
                        <span className="mt-1 block text-[11px] text-muted">{new Date(order.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${order.status === 'completed' ? 'bg-green-50 text-green-700' : order.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{order.status}</span>
                      <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                    </button>
                    {isSelected && (
                      <div className="border-t border-line bg-paper/60 px-4 py-3">
                        {orderDetailsLoading ? (
                          <div className="flex items-center gap-2 py-3 text-xs font-medium text-muted">
                            <LoaderCircle size={14} className="animate-spin text-forest" /> Loading order items
                          </div>
                        ) : orderDetailsError ? (
                          <p className="py-2 text-xs font-medium text-rose-700">{orderDetailsError}</p>
                        ) : selectedOrder ? (
                          <>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Items in this order</p>
                            <div className="divide-y divide-line">
                              {selectedOrder.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-ink">{item.product_name || `Product #${item.product_id}`}</p>
                                    <p className="mt-1 text-[10px] text-muted">{item.quantity} × {formatMoney(item.price)}</p>
                                  </div>
                                  <span className="shrink-0 text-xs font-extrabold text-ink">{formatMoney(Number(item.price) * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            {selectedOrder.order_items.length === 0 && <p className="py-2 text-xs text-muted">This order has no items.</p>}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
              {hasMoreOrders && (
                <button
                  type="button"
                  onClick={loadMoreOrders}
                  disabled={loadingMoreOrders}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-xs font-bold text-forest transition hover:bg-paper disabled:opacity-60"
                >
                  {loadingMoreOrders && <LoaderCircle size={14} className="animate-spin" />}
                  {loadingMoreOrders ? 'Loading more orders' : 'Load more orders'}
                </button>
              )}
            </div>
          )}
        </div>

        <button onClick={() => signOut()} disabled={busyAction !== null} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60">
          {busyAction === 'current' ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
          Sign out
        </button>
        <button onClick={() => signOut(true)} disabled={busyAction !== null} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-muted transition hover:bg-paper hover:text-ink disabled:opacity-60">
          {busyAction === 'all' ? <LoaderCircle size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          Sign out all devices
        </button>
        <p className="mt-2 text-center text-[10px] leading-5 text-muted">
          Other existing access tokens remain valid until they expire.
        </p>
      </section>
    </div>
  );
}

export default AccountModal;
