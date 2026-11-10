import { FormEvent, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
} as const;

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-clip bg-[#0c0a09] px-4 py-10 text-stone-200">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID_STYLE} />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]"
      />
      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2.5 text-lg font-semibold tracking-tight text-white"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-500 text-sm font-bold text-orange-950 shadow-lg shadow-orange-500/30">
            G
          </span>
          Palastra
        </Link>
        {children}
      </div>
    </div>
  );
}

export default function Activate() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/activation/validate", { email, code });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Activation failed");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <Shell>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
          <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-lg shadow-orange-500/30">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-orange-400/30 motion-reduce:hidden" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative h-7 w-7"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Trial activated!</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            Your 30-day trial has started. Log in to access your dashboard.
          </p>
          <button
            onClick={() => nav("/login")}
            className="mt-6 w-full rounded-xl bg-gradient-to-b from-orange-300 to-orange-500 py-3 text-base font-semibold text-orange-950 shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09] sm:text-sm"
          >
            Go to login
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-400">
            <span className="h-px w-4 bg-orange-400/60" />
            Step 2 of 2
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Activate your gym</h1>
          <p className="mt-1.5 text-sm text-stone-400">
            Enter the activation code sent to your email.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormField
            label="Activation code"
            name="code"
            placeholder="GYM-XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-2.5 text-sm text-rose-300"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-b from-orange-300 to-orange-500 py-3 text-base font-semibold text-orange-950 shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09] sm:text-sm"
          >
            {busy ? "Activating…" : "Activate"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          Don't have a code?{" "}
          <Link
            to="/register"
            className="font-medium text-orange-300 transition-colors hover:text-orange-200"
          >
            Register your gym
          </Link>
        </p>
      </div>
    </Shell>
  );
}