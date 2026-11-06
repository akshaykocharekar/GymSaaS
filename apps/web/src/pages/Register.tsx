import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";

/* ─── Shared dark field (same props as FormField) ─────── */
type FieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
};

function Field({ label, name, type = "text", value, onChange, autoComplete, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-stone-300 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-base text-white placeholder:text-stone-600 outline-none transition focus:border-orange-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-400/10"
      />
    </div>
  );
}

/* ─── Page shell: charcoal + grid + orange glow ───────── */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#0c0a09] text-stone-200 antialiased selection:bg-orange-400/30">
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 20%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 20%, #000 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute -top-40 left-1/2 -z-10 h-[480px] w-[760px] max-w-[160vw] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(249,115,22,0.28), rgba(249,115,22,0.06) 60%, transparent)",
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 py-8 sm:py-12">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-[15px] font-semibold tracking-tight text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-400 text-sm font-bold text-orange-950">
            G
          </span>
          Gymora
        </Link>
        <div className="flex flex-1 items-start sm:items-center">{children}</div>
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    gymName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [params] = useSearchParams();
  const statusParam = params.get("status");
  const [busy, setBusy] = useState(false);

  function update(k: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/auth/register-gym", form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (submitted || statusParam === "pending") {
    return (
      <Shell>
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/25">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Registration received</h1>
          <p className="text-stone-400 leading-relaxed">
            Your application is awaiting approval. You&apos;ll receive an activation
            code by email once approved.
          </p>
          <Link
            to="/activate"
            className="group inline-flex items-center gap-1.5 pt-2 font-medium text-orange-300 transition-colors hover:text-orange-200"
          >
            Have a code already? Activate
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8 space-y-7">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-400">
            <span className="h-px w-6 bg-orange-400/60" />
            Free trial
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Register your gym</h1>
          <p className="mt-2 text-sm text-stone-400 leading-relaxed">
            Get started with a 30-day free trial after approval.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Gym name" name="gymName" value={form.gymName} onChange={update("gymName")} autoComplete="organization" required />
          <Field label="Owner's full name" name="ownerName" value={form.ownerName} onChange={update("ownerName")} autoComplete="name" required />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" name="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" required />
          </div>

          <Field label="Gym address" name="address" value={form.address} onChange={update("address")} autoComplete="street-address" required />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" name="password" type="password" value={form.password} onChange={update("password")} autoComplete="new-password" required />
            <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} autoComplete="new-password" required />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-orange-400 py-3.5 text-[15px] font-semibold text-orange-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-300 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
          >
            {busy ? "Submitting…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-orange-300 transition-colors hover:text-orange-200">
            Log in
          </Link>
        </p>
      </div>
    </Shell>
  );
}