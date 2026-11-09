import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  updated: string;
  children: ReactNode;
}

export default function LegalLayout({ title, updated, children }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-[15px] font-semibold tracking-tight">
            Palastra
          </Link>
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: {updated}
        </p>

        <div className="mt-8 prose prose-slate max-w-none legal-content">
          {children}
        </div>

        <div className="mt-16 pt-6 border-t border-slate-200 text-sm text-slate-500 space-y-1">
          <p>
            Palastra · Sole proprietorship owned by Akshay Kocharekar
          </p>
          <p>
            Margao, Goa, India · Serving gyms across Goa and beyond
          </p>
          <p>
            Questions? Email{" "}
            <a
              href="mailto:palastrasupport@gmail.com"
              className="text-slate-900 underline"
            >
              palastrasupport@gmail.com
            </a>
          </p>
        </div>
      </main>

      <style>{`
        .legal-content h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p,
        .legal-content li {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          padding-left: 1.25rem;
          list-style-type: disc;
          margin-bottom: 1rem;
        }
        .legal-content a {
          color: #0f172a;
          text-decoration: underline;
        }
        .legal-content strong {
          color: #0f172a;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
