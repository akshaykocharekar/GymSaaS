import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">Trial activated!</h1>
          <p className="text-slate-600">
            Your 30-day trial has started. Log in to access your dashboard.
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
          <h1 className="text-2xl font-bold">Activate your gym</h1>
          <p className="text-sm text-slate-600 mt-1">
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
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? "Activating…" : "Activate"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600">
          Don't have a code?{" "}
          <Link to="/register" className="text-primary-600 font-medium">
            Register your gym
          </Link>
        </p>
      </div>
    </div>
  );
}
