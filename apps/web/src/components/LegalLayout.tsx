import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  updated: string;
  children: ReactNode;
}

export default function LegalLayout({ title, updated, children }: Props) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#0c0a09] text-stone-200 antialiased selection:bg-orange-400/30">
      {/* background: faint grid + orange glow (matches the rest of the app) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 40% at 50% 0%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 40% at 50% 0%, #000 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[760px] max-w-[160vw] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(249,115,22,0.22), rgba(249,115,22,0.05) 60%, transparent)",
        }}
      />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0c0a09]/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 text-sm font-bold text-orange-950 shadow-md shadow-orange-500/30">
              G
            </span>
            Palastra
          </Link>
          <Link
            to="/"
            className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-stone-300 transition-colors hover:border-orange-400/40 hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-400">
          <span className="h-px w-6 bg-orange-400/60" />
          Legal
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-stone-400">
          Last updated: {updated}
        </p>

        <div className="mt-10 max-w-none legal-content">
          {children}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-stone-400 space-y-1.5">
          <p className="font-medium text-stone-200">
            Palastra · Sole proprietorship owned by Akshay Kocharekar
          </p>
          <p>
            Margao, Goa, India · Serving gyms across Goa and beyond
          </p>
          <p>
            Questions? Email{" "}
            <a
              href="mailto:palastrasupport@gmail.com"
              className="text-orange-300 underline underline-offset-2 transition-colors hover:text-orange-200"
            >
              palastrasupport@gmail.com
            </a>
          </p>
        </div>
      </main>

      <style>{`
        .legal-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .legal-content > h2:first-child {
          margin-top: 0;
          padding-top: 0;
          border-top: 0;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #fafaf9;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p,
        .legal-content li {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #d6d3d1;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          padding-left: 1.25rem;
          list-style-type: disc;
          margin-bottom: 1rem;
        }
        .legal-content ol {
          padding-left: 1.25rem;
          list-style-type: decimal;
          margin-bottom: 1rem;
        }
        .legal-content li::marker {
          color: #fb923c;
        }
        .legal-content a {
          color: #fdba74;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .legal-content a:hover {
          color: #fed7aa;
        }
        .legal-content strong {
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}