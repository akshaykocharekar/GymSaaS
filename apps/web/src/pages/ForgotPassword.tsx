import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Check your email
          </h1>
          <p className="text-sm text-slate-600 text-center">
            If an account exists for <strong>{email}</strong>, you'll receive a
            password reset link within a few minutes. The link expires in 1
            hour.
          </p>
          <p className="text-xs text-slate-500 text-center">
            Didn't receive it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-primary-600 hover:underline"
            >
              try again
            </button>
            .
          </p>
          <div className="pt-2 text-center">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your email and we'll send you a reset link.
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <div className="text-sm text-center text-slate-600">
          Remember your password?{" "}
          <Link to="/login" className="text-primary-600 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
