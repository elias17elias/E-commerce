import { Leaf } from 'lucide-react';

function Logo({ light = false }) {
  return (
    <a href="#" className={`group flex items-center gap-2.5 ${light ? 'text-white' : 'text-ink'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-lime transition-transform group-hover:-rotate-6">
        <Leaf size={19} strokeWidth={2.2} />
      </span>
      <span className="font-display text-[15px] font-extrabold leading-tight tracking-[-0.04em]">
        good things<span className={light ? 'text-lime' : 'text-forest'}>.</span>
        <span className={`block text-[9px] font-bold uppercase tracking-[0.21em] ${light ? 'text-white/55' : 'text-muted'}`}>
          everyday market
        </span>
      </span>
    </a>
  );
}

export default Logo;
