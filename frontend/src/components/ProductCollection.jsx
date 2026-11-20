import {
  ArrowDownRight,
  ArrowRight,
  LoaderCircle,
  PackageCheck,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import ProductCard from './ProductCard.jsx';

function ProductCollection({
  products,
  loadingProducts,
  loadingMore,
  loadError,
  hasMore,
  query,
  onQueryChange,
  onRetry,
  inStockOnly,
  onInStockToggle,
  filters,
  filterDraft,
  onFilterDraftChange,
  filtersOpen,
  onFiltersOpenChange,
  onApplyFilters,
  onClearFilters,
  onClearSearch,
  onLoadMore,
  onAdd,
  favorites,
  onFavorite,
}) {
  const activeRangeFilterCount = Object.values(filters).filter((value) => value !== '').length;

  return (
    <section id="collection" className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-12">
      <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">The considered collection</p>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.055em] text-ink sm:text-[42px]">Find your everyday favorite.</h2>
          <p className="mt-2 text-sm text-muted">A few good things can go a long way.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:w-[350px]">
          <label className="relative block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/70 focus:border-forest"
              placeholder="Search something lovely"
              aria-label="Search products"
            />
          </label>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onFiltersOpenChange(!filtersOpen)}
              aria-expanded={filtersOpen}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold transition ${filtersOpen || activeRangeFilterCount > 0 ? 'border-forest bg-forest text-white' : 'border-line bg-white text-muted hover:border-forest hover:text-forest'}`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeRangeFilterCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[9px] text-forest">
                  {activeRangeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={onInStockToggle}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold transition ${inStockOnly ? 'border-forest bg-forest text-white' : 'border-line bg-white text-muted hover:border-forest hover:text-forest'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${inStockOnly ? 'bg-lime' : 'bg-green-500'}`} />
              In stock only
            </button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="mb-8 rounded-[22px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Make it yours</p>
              <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-ink">Filter the collection</h3>
            </div>
            <button type="button" onClick={() => onFiltersOpenChange(false)} aria-label="Close filters" className="grid h-8 w-8 place-items-center rounded-full bg-paper text-muted hover:text-ink"><X size={15} /></button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-ink">Price range</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label text-[11px]">Minimum
                  <input type="number" min="0" max="99999999.99" step="0.01" value={filterDraft.minPrice} onChange={(event) => onFilterDraftChange('minPrice', event.target.value)} className="field-input" placeholder="0.00" />
                </label>
                <label className="field-label text-[11px]">Maximum
                  <input type="number" min="0" max="99999999.99" step="0.01" value={filterDraft.maxPrice} onChange={(event) => onFilterDraftChange('maxPrice', event.target.value)} className="field-input" placeholder="No limit" />
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-ink">Stock range</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label text-[11px]">Minimum
                  <input type="number" min="0" max="2147483647" step="1" value={filterDraft.minStock} onChange={(event) => onFilterDraftChange('minStock', event.target.value)} className="field-input" placeholder="Any" />
                </label>
                <label className="field-label text-[11px]">Maximum
                  <input type="number" min="0" max="2147483647" step="1" value={filterDraft.maxStock} onChange={(event) => onFilterDraftChange('maxStock', event.target.value)} className="field-input" placeholder="No limit" />
                </label>
              </div>
            </fieldset>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <button type="button" onClick={onClearFilters} className="text-xs font-bold text-muted hover:text-forest">Clear all filters</button>
            <button type="button" onClick={onApplyFilters} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#1d3b30]">
              Show results <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {loadingProducts && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square rounded-[20px] bg-[#eae9e3]" />
              <div className="mt-4 h-3 w-2/3 rounded bg-[#eae9e3]" />
              <div className="mt-2 h-3 w-1/3 rounded bg-[#eae9e3]" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center">
          <p className="font-display text-xl font-extrabold text-ink">The shop is taking a breather.</p>
          <p className="mt-2 text-sm text-muted">{loadError}</p>
          <button onClick={onRetry} className="mt-5 text-sm font-bold text-forest hover:underline">Try loading again</button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime/60 text-forest"><PackageCheck size={25} /></span>
          <h3 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">{query ? 'No matches just yet.' : 'The shelves are getting ready.'}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{query ? 'Try another search, or clear your filters to see everything.' : 'There are no products to show right now. Check back soon.'}</p>
          {query && <button onClick={onClearSearch} className="mt-5 text-sm font-bold text-forest hover:underline">Clear search</button>}
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between text-[11px] text-muted">
            <span>{query ? `Results for “${query}”` : 'Made for everyday living'}</span>
            <span>{products.length}{hasMore ? '+' : ''} thoughtful finds</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAdd={onAdd}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 text-center">
              <button onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-xs font-bold text-ink transition hover:border-forest hover:bg-forest hover:text-white disabled:opacity-60">
                {loadingMore ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowDownRight size={15} />}
                Load more good things
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductCollection;
