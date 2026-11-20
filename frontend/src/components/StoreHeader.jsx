import { ChevronDown, Search, ShoppingBag, SlidersHorizontal, UserRound } from 'lucide-react';
import Logo from './Brand.jsx';

function StoreHeader({ user, sessionLoading, cartCount, onSearch, onSignIn, onAccount, onCart, onAdmin }) {
  return (
    <>
      <div className="border-b border-white/10 bg-[#20392f] px-4 py-2 text-center text-[10px] font-semibold tracking-[0.12em] text-white/75 sm:text-[11px]">
        A little more good in your everyday <span className="mx-1.5 text-lime">✳</span> Thoughtful finds, always
      </div>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#collection" className="text-xs font-bold text-ink transition hover:text-forest">Shop all</a>
            <a href="#about" className="text-xs font-semibold text-muted transition hover:text-forest">Our point of view</a>
            {user?.role === 'admin' && (
              <button onClick={onAdmin} className="text-xs font-semibold text-muted transition hover:text-forest">Admin studio</button>
            )}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onSearch} aria-label="Search products" className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-white">
              <Search size={18} />
            </button>
            {user ? (
              <button onClick={onAccount} className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-left sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-lime/70 text-[11px] font-extrabold text-forest">{user.name?.slice(0, 1).toUpperCase()}</span>
                <span className="max-w-[104px] truncate text-xs font-bold text-ink">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-muted" />
              </button>
            ) : (
              <button onClick={onSignIn} className="hidden rounded-full px-3 py-2 text-xs font-bold text-ink transition hover:bg-white sm:block">
                {sessionLoading ? '…' : 'Sign in'}
              </button>
            )}
            {user?.role === 'admin' && (
              <button onClick={onAdmin} aria-label="Open admin studio" className="grid h-10 w-10 place-items-center rounded-full text-forest transition hover:bg-white md:hidden"><SlidersHorizontal size={17} /></button>
            )}
            <button onClick={onCart} className="relative flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-white transition hover:bg-[#1d3b30]" aria-label={`Open shopping bag, ${cartCount} items`}>
              <ShoppingBag size={16} />
              <span className="hidden text-xs font-bold sm:inline">Bag</span>
              <span className="grid min-w-[19px] place-items-center rounded-full bg-lime px-1 text-[10px] font-extrabold text-forest">{cartCount}</span>
            </button>
            <button onClick={user ? onAccount : onSignIn} aria-label={user ? 'Account' : 'Sign in'} className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-white sm:hidden">
              <UserRound size={18} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default StoreHeader;
