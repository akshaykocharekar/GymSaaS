import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600 mt-1">Log in to Palastra</p>
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

          <div>
            <FormField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="text-sm text-center text-slate-600 space-y-1">
          <p>
            New here?{" "}
            <Link to="/register" className="text-primary-600 font-medium">
              Register your gym
            </Link>
          </p>
          <p>
            Have an activation code?{" "}
            <Link to="/activate" className="text-primary-600 font-medium">
              Activate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
