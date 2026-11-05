import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { ApiError } from "../lib/api.js";

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

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 sm:py-12">
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

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      const stored = JSON.parse(localStorage.getItem("gymora_auth") || "{}");
      nav(
        stored.user?.role === "SUPERADMIN"
          ? "/admin/registrations"
          : "/app/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8 space-y-7">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-400">
            <span className="h-px w-6 bg-orange-400/60" />
            Log in
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-400">Log in to Gymora</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

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
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="space-y-1.5 border-t border-white/10 pt-6 text-center text-sm text-stone-400">
          <p>
            New here?{" "}
            <Link to="/register" className="font-medium text-orange-300 transition-colors hover:text-orange-200">
              Register your gym
            </Link>
          </p>
          <p>
            Have an activation code?{" "}
            <Link to="/activate" className="font-medium text-orange-300 transition-colors hover:text-orange-200">
              Activate
            </Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}