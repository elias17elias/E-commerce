import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, refreshSession } from './api.js';
import AccountModal from './components/AccountModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Hero from './components/Hero.jsx';
import Notice from './components/Notice.jsx';
import ProductCollection from './components/ProductCollection.jsx';
import StoreFooter, { AboutSection } from './components/StoreFooter.jsx';
import StoreHeader from './components/StoreHeader.jsx';

const CART_STORAGE_KEY = 'good-things-cart';
const RANGE_FILTER_KEYS = ['minPrice', 'maxPrice', 'minStock', 'maxStock'];

function appendRangeFilters(params, filters) {
  for (const key of RANGE_FILTER_KEYS) {
    if (filters[key] !== '') params.set(key, filters[key]);
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
  });
  const [filterDraft, setFilterDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authMode, setAuthMode] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notice, setNotice] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type });
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setNotice(null), 4200);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then(async ({ accessToken }) => {
        const currentUser = await api('/auth/me', { token: accessToken });
        if (active) {
          setToken(accessToken);
          setUser(currentUser);
        }
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          notify('Could not restore your session. You can still browse the shop.', 'error');
        }
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });
    return () => { active = false; };
  }, [notify]);

  useEffect(() => {
    if (window.location.pathname === '/reset-password') {
      if (new URLSearchParams(window.location.search).get('token')) {
        setAuthMode('reset');
      } else {
        notify('This password reset link is invalid or incomplete.', 'error');
        setAuthMode('login');
      }
    }
  }, [notify]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingProducts(true);
      setLoadError('');
      const params = new URLSearchParams({ limit: '24' });
      if (query.trim()) params.set('q', query.trim());
      if (inStockOnly) params.set('inStock', 'true');
      appendRangeFilters(params, filters);
      try {
        const result = await api(`/products?${params}`, { signal: controller.signal });
        if (active) {
          setProducts(result.data);
          setCursor(result.pagination.nextCursor);
          setHasMore(result.pagination.hasMore);
        }
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          setLoadError(error.message || 'We could not load the collection.');
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, inStockOnly, filters, reloadKey]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: '24', cursor });
      if (query.trim()) params.set('q', query.trim());
      if (inStockOnly) params.set('inStock', 'true');
      appendRangeFilters(params, filters);
      const result = await api(`/products?${params}`);
      setProducts((current) => [...current, ...result.data]);
      setCursor(result.pagination.nextCursor);
      setHasMore(result.pagination.hasMore);
    } catch (error) {
      notify(error.message || 'Could not load more products.', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing && existing.quantity >= Number(product.stock)) {
      notify('That is all the stock currently available.', 'error');
      return;
    }
    setCart((current) => {
      const currentItem = current.find((item) => item.id === product.id);
      if (currentItem) {
        return current.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.stock)) }
          : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    notify(`${product.name} added to your bag.`);
  };

  const changeQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== productId));
      return;
    }
    setCart((current) => current.map((item) => item.id === productId
      ? { ...item, quantity: Math.min(quantity, Number(item.stock)) }
      : item));
  };

  const authenticateUser = async (accessToken) => {
    const currentUser = await api('/auth/me', { token: accessToken });
    setToken(accessToken);
    setUser(currentUser);
    notify(`Welcome${currentUser.name ? `, ${currentUser.name.split(' ')[0]}` : ''}!`);
  };

  const signOut = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (error) {
      if (error.status !== 401) notify('You were signed out, but the session could not be revoked.', 'error');
    } finally {
      setToken('');
      setUser(null);
    }
  };

  const signOutAll = async () => {
    try {
      await api('/auth/logout-all', { token, method: 'POST' });
      notify('Refresh-token sessions have been revoked. Existing access tokens remain valid until they expire.');
    } catch {
      notify(
        'This device was signed out, but other sessions may still be active.',
        'error',
      );
    } finally {
      setToken('');
      setUser(null);
    }
  };

  const checkout = async () => {
    if (!user) {
      setCartOpen(false);
      setAuthMode('login');
      return;
    }
    setCheckingOut(true);
    try {
      const order = await api('/orders', {
        token,
        body: {
          data: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        },
      });
      setCart([]);
      setCartOpen(false);
      setUser((current) => current ? { ...current, balance: order.balance } : current);
      notify(`Order #${order.id} is in. Thanks for shopping thoughtfully!`);
      const updatedUser = await api('/auth/me', { token });
      setUser(updatedUser);
    } catch (error) {
      notify(error.message || 'Your order could not be placed.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id)
      ? current.filter((favoriteId) => favoriteId !== id)
      : [...current, id]);
  };

  const applyFilters = () => {
    const nextFilters = Object.fromEntries(
      RANGE_FILTER_KEYS.map((key) => [key, filterDraft[key].trim()]),
    );
    const priceFields = ['minPrice', 'maxPrice'];
    const stockFields = ['minStock', 'maxStock'];
    if (priceFields.some((key) =>
      nextFilters[key] !== '' &&
      (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(nextFilters[key]) ||
        Number(nextFilters[key]) > 99999999.99)
    )) {
      notify('Enter prices from 0 to 99,999,999.99 with up to two decimal places.', 'error');
      return;
    }
    if (stockFields.some((key) =>
      nextFilters[key] !== '' &&
      (!/^(?:0|[1-9]\d*)$/.test(nextFilters[key]) ||
        Number(nextFilters[key]) > 2147483647)
    )) {
      notify('Enter stock as a whole number from 0 to 2,147,483,647.', 'error');
      return;
    }
    if (
      nextFilters.minPrice !== '' &&
      nextFilters.maxPrice !== '' &&
      Number(nextFilters.minPrice) > Number(nextFilters.maxPrice)
    ) {
      notify('Minimum price cannot be greater than maximum price.', 'error');
      return;
    }
    if (
      nextFilters.minStock !== '' &&
      nextFilters.maxStock !== '' &&
      Number(nextFilters.minStock) > Number(nextFilters.maxStock)
    ) {
      notify('Minimum stock cannot be greater than maximum stock.', 'error');
      return;
    }
    setFilters(nextFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = { minPrice: '', maxPrice: '', minStock: '', maxStock: '' };
    setFilterDraft(emptyFilters);
    setFilters(emptyFilters);
    setInStockOnly(false);
  };

  const clearSearchAndFilters = () => {
    setQuery('');
    clearFilters();
  };

  const scrollToProducts = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <StoreHeader
        user={user}
        sessionLoading={sessionLoading}
        cartCount={cartCount}
        onSearch={scrollToProducts}
        onSignIn={() => setAuthMode('login')}
        onAccount={() => setAccountOpen(true)}
        onCart={() => setCartOpen(true)}
        onAdmin={() => setAdminOpen(true)}
      />
      <main>
        <Hero onShop={scrollToProducts} />
        <ProductCollection
          products={products}
          loadingProducts={loadingProducts}
          loadingMore={loadingMore}
          loadError={loadError}
          hasMore={hasMore}
          query={query}
          onQueryChange={setQuery}
          onRetry={() => setReloadKey((current) => current + 1)}
          inStockOnly={inStockOnly}
          onInStockToggle={() => setInStockOnly((current) => !current)}
          filters={filters}
          filterDraft={filterDraft}
          onFilterDraftChange={(key, value) => setFilterDraft((current) => ({ ...current, [key]: value }))}
          filtersOpen={filtersOpen}
          onFiltersOpenChange={(isOpen) => {
            if (isOpen) setFilterDraft(filters);
            setFiltersOpen(isOpen);
          }}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          onClearSearch={clearSearchAndFilters}
          onLoadMore={loadMore}
          onAdd={addToCart}
          favorites={favorites}
          onFavorite={toggleFavorite}
        />
        <AboutSection />
      </main>
      <StoreFooter />

      <Notice notice={notice} onClose={() => setNotice(null)} />
      {cartOpen && (
        <CartDrawer
          cart={cart}
          user={user}
          onClose={() => setCartOpen(false)}
          onQuantity={changeQuantity}
          onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))}
          onCheckout={checkout}
          checkingOut={checkingOut}
        />
      )}
      {authMode && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onAuthenticated={authenticateUser}
          onNotice={notify}
        />
      )}
      {accountOpen && user && (
        <AccountModal
          user={user}
          token={token}
          onClose={() => setAccountOpen(false)}
          onLogout={signOut}
          onLogoutAll={signOutAll}
        />
      )}
      {adminOpen && user?.role === 'admin' && (
        <AdminPanel token={token} onClose={() => setAdminOpen(false)} onNotice={notify} />
      )}
    </div>
  );
}

export default App;
