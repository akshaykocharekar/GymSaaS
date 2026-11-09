import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid reset link</h1>
          <p className="text-sm text-slate-600">
            This link is missing or malformed. Please request a new password
            reset.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Password reset
          </h1>
          <p className="text-sm text-slate-600">
            Your password has been updated. You can now log in with your new
            password.
          </p>
          <button
            onClick={() => nav("/login")}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose a strong new password for your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="New password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <div className="text-sm text-center text-slate-600">
          <Link to="/login" className="text-primary-600 font-medium">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
