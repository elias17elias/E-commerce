import { ArrowRight, BadgeCheck, Leaf, Sparkles } from 'lucide-react';

function Hero({ onShop }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest">
      <div className="absolute -right-28 -top-44 -z-10 h-[520px] w-[520px] rounded-full border border-white/10 sm:right-[-5%] sm:top-[-52%]" />
      <div className="absolute right-[8%] top-[15%] -z-10 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:py-[76px]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-lime">
            <Sparkles size={13} /> A more thoughtful kind of shopping
          </div>
          <h1 className="font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.065em] text-white sm:text-6xl lg:text-[70px]">
            A little good,<br />
            <span className="text-lime">for every day.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65 sm:text-base">
            Useful, lovely things that make ordinary moments feel a bit more considered.
          </p>
          <button onClick={onShop} className="mt-8 inline-flex items-center gap-4 rounded-full bg-lime px-5 py-3.5 text-sm font-extrabold text-forest transition hover:-translate-y-0.5 hover:bg-white">
            Shop the collection <ArrowRight size={17} />
          </button>
          <div className="mt-10 flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
            <span className="flex items-center gap-1.5"><Leaf size={13} /> Better by design</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span>Chosen with care</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[470px] lg:max-w-none">
          <div className="absolute -left-2 top-7 z-10 rounded-2xl bg-white px-4 py-3 shadow-soft sm:-left-4 sm:top-12">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime/60 text-forest"><BadgeCheck size={16} /></span>
              <div><p className="text-[11px] font-extrabold text-ink">Small things,</p><p className="text-[10px] text-muted">made to matter</p></div>
            </div>
          </div>
          <div className="relative mx-auto aspect-[1.12/1] max-w-[450px] overflow-hidden rounded-[34px] bg-[#d7e3ce] p-5 sm:p-7">
            <div className="absolute -right-10 -top-12 h-52 w-52 rounded-full bg-[#b7cba9]" />
            <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full border-[22px] border-white/30" />
            <div className="absolute inset-x-7 bottom-7 top-7 rounded-[28px] border border-white/45" />
            <div className="absolute inset-0 grid place-items-center text-[142px] drop-shadow-[0_24px_20px_rgba(47,76,53,0.2)] sm:text-[190px]" aria-hidden="true">🪴</div>
            <div className="absolute bottom-6 left-7 z-10 rounded-full bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-forest backdrop-blur">The everyday edit · no. 01</div>
          </div>
          <div className="absolute -bottom-4 right-0 z-10 grid h-[76px] w-[76px] place-items-center rounded-full bg-coral text-center text-[9px] font-extrabold uppercase leading-4 tracking-[0.12em] text-white shadow-soft sm:-right-4 sm:h-[94px] sm:w-[94px] sm:text-[10px]">
            good things<br />live here
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
