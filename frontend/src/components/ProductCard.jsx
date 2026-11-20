import { Heart, Plus } from 'lucide-react';
import { formatMoney } from '../api.js';

const artStyles = [
  { bg: 'from-[#f6ddd0] to-[#f3c7b5]', accent: 'bg-[#edb098]', icon: '☕' },
  { bg: 'from-[#d9e3ce] to-[#bbceb5]', accent: 'bg-[#a9c59e]', icon: '🪴' },
  { bg: 'from-[#e5def1] to-[#d0c4e7]', accent: 'bg-[#c3b4df]', icon: '🧺' },
  { bg: 'from-[#f5e8bd] to-[#f2d896]', accent: 'bg-[#eacb77]', icon: '🕯️' },
  { bg: 'from-[#d6e5e6] to-[#b9d1d1]', accent: 'bg-[#9fc4c3]', icon: '📚' },
  { bg: 'from-[#f4d8dc] to-[#e9bcc4]', accent: 'bg-[#df9faa]', icon: '🍓' },
];

const getArtwork = (name = '', index = 0) => {
  const text = name.toLowerCase();
  if (/plant|leaf|garden|flower/.test(text)) return artStyles[1];
  if (/book|journal|notebook/.test(text)) return artStyles[4];
  if (/candle|light|lamp/.test(text)) return artStyles[3];
  if (/basket|bag|storage/.test(text)) return artStyles[2];
  if (/coffee|tea|mug|cup/.test(text)) return artStyles[0];
  return artStyles[index % artStyles.length];
};

export function ProductArtwork({ product, index, className = '' }) {
  const art = getArtwork(product.name, index);
  return (
    <div className={`product-art relative isolate grid place-items-center overflow-hidden bg-gradient-to-br ${art.bg} ${className}`}>
      <span className={`absolute -right-7 -top-8 h-36 w-36 rounded-full ${art.accent} opacity-50`} />
      <span className="absolute -bottom-12 -left-7 h-36 w-36 rounded-full border-[18px] border-white/35" />
      <span className="relative z-10 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" aria-hidden="true">
        {art.icon}
      </span>
      <span className="absolute bottom-3 left-3 rounded-full bg-white/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.17em] text-ink/60 backdrop-blur">
        good things, well made
      </span>
    </div>
  );
}

function ProductCard({ product, index, onAdd, favorite, onFavorite }) {
  const outOfStock = Number(product.stock) < 1;
  return (
    <article className="group min-w-0">
      <div className="relative mb-4 overflow-hidden rounded-[20px]">
        <ProductArtwork product={product} index={index} className="aspect-[1/1.05] text-[76px] sm:aspect-[1/1.15] sm:text-[90px]" />
        <button
          type="button"
          onClick={() => onFavorite(product.id)}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${favorite ? 'bg-white text-rose-500' : 'bg-white/75 text-ink/55 hover:bg-white hover:text-rose-500'}`}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        {outOfStock && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">{product.name}</p>
          <p className="mt-1 text-xs text-muted">{outOfStock ? 'Back soon' : `${product.stock} in stock`}</p>
        </div>
        <p className="shrink-0 text-[14px] font-bold text-ink">{formatMoney(product.price)}</p>
      </div>
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => onAdd(product)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-xs font-bold text-ink transition hover:border-forest hover:bg-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add to bag <Plus size={15} />
      </button>
    </article>
  );
}

export default ProductCard;
