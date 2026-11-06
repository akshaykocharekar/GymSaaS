import { ReactNode, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-[#14110f] text-stone-200 shadow-2xl shadow-black/60 animate-slide-up sm:mx-auto sm:mb-4 sm:max-w-lg sm:rounded-3xl sm:border-b"
      >
        {/* soft orange glow along the top edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(249,115,22,0.12), transparent 100%)",
          }}
        />

        <div className="relative sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        {title && (
          <div className="relative px-6 pt-4 pb-3 border-b border-white/5">
            <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          </div>
        )}
        <div className="relative overflow-y-auto px-4 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in.fade-in { animation: fade-in 0.15s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up, .animate-in.fade-in { animation: none; }
        }
      `}</style>
    </>
  );
}