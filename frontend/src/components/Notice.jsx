import { Check, CircleHelp, X } from 'lucide-react';

function Notice({ notice, onClose }) {
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <div className={`fixed right-4 top-4 z-[80] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-soft sm:right-6 sm:top-6 ${isError ? 'border-rose-100 bg-white text-rose-800' : 'border-green-100 bg-white text-forest'}`}>
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${isError ? 'bg-rose-50' : 'bg-green-50'}`}>
        {isError ? <CircleHelp size={14} /> : <Check size={14} />}
      </span>
      <p className="max-w-sm text-sm font-medium leading-6">{notice.message}</p>
      <button onClick={onClose} className="ml-1 mt-1 text-muted hover:text-ink" aria-label="Close notification">
        <X size={15} />
      </button>
    </div>
  );
}

export default Notice;
