import { ArrowRight, Heart, Leaf } from 'lucide-react';
import Logo from './Brand.jsx';

export function AboutSection() {
  return (
    <section id="about" className="bg-[#efeee8]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">A little point of view</p>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.055em] text-ink sm:text-4xl">Keep the things that make the everyday feel better.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">We believe useful can be beautiful, and the best finds are the ones you reach for again and again. This is a small, considered collection for the life you’re already living.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold text-ink"><Leaf size={15} className="text-forest" /> Made to be used</span>
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold text-ink"><Heart size={15} className="text-coral" /> Chosen with care</span>
        </div>
      </div>
    </section>
  );
}

function StoreFooter() {
  return (
    <footer className="bg-forest text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Logo light />
        <p className="text-xs text-white/55">A thoughtful little corner of the internet. © {new Date().getFullYear()} Good Things Market</p>
        <a href="#collection" className="flex items-center gap-2 text-xs font-bold text-lime hover:text-white">Back to the good stuff <ArrowRight size={14} /></a>
      </div>
    </footer>
  );
}

export default StoreFooter;
