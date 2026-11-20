import { ArrowRight, LoaderCircle, Minus, Plus, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { formatMoney } from '../api.js';
import { ProductArtwork } from './ProductCard.jsx';

function CartDrawer({ cart, onClose, onQuantity, onRemove, onCheckout, checkingOut, user }) {
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="absolute bottom-0 right-0 flex h-[min(100%,760px)] w-full max-w-[480px] flex-col rounded-t-[28px] bg-white shadow-soft sm:bottom-4 sm:right-4 sm:h-[calc(100%-2rem)] sm:rounded-[28px]" aria-label="Shopping bag">
        <div className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-7">
          <div>
            <p className="eyebrow">Your picks</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">Shopping bag <span className="text-muted">({count})</span></h2>
          </div>
          <button onClick={onClose} aria-label="Close shopping bag" className="grid h-10 w-10 place-items-center rounded-full bg-paper text-muted hover:text-ink"><X size={18} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-lime/60 text-forest"><ShoppingBag size={30} /></span>
            <h3 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">It’s looking a little light.</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted">Find something useful, lovely, or a bit of both.</p>
            <button onClick={onClose} className="mt-6 text-sm font-bold text-forest hover:underline">Keep exploring <ArrowRight size={14} className="ml-1 inline" /></button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-7">
              {cart.map((item, index) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-line p-3">
                  <ProductArtwork product={item} index={index} className="h-[92px] w-[92px] shrink-0 rounded-xl text-4xl" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">{formatMoney(item.price)} each</p>
                      </div>
                      <button onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`} className="text-muted hover:text-rose-600"><X size={15} /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full bg-paper p-1">
                        <button onClick={() => onQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} className="grid h-6 w-6 place-items-center rounded-full text-ink hover:bg-white"><Minus size={13} /></button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => onQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= Number(item.stock)} className="grid h-6 w-6 place-items-center rounded-full text-ink hover:bg-white disabled:opacity-30"><Plus size={13} /></button>
                      </div>
                      <span className="text-sm font-extrabold text-ink">{formatMoney(Number(item.price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-6 pb-6 pt-5 sm:px-7">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Subtotal</span><span>{formatMoney(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-extrabold text-ink">
                <span>Total</span><span className="font-display text-xl">{formatMoney(total)}</span>
              </div>
              {user && (
                <p className="mt-2 text-right text-xs text-muted">Available balance: {formatMoney(user.balance)}</p>
              )}
              <button onClick={onCheckout} disabled={checkingOut} className="primary-button mt-5 w-full">
                {checkingOut ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
                {user ? 'Place order' : 'Sign in to check out'}
                {!checkingOut && <ArrowRight size={16} />}
              </button>
              <p className="mt-3 text-center text-[10px] leading-5 text-muted">Your order is processed securely. Stock and balance are confirmed at checkout.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
