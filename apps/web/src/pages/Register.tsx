import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";

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
  const [busy, setBusy] = useState(false);

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">Registration received</h1>
          <p className="text-slate-600">
            Your application is awaiting approval. You'll receive an activation
            code by email once approved.
          </p>
          <Link to="/activate" className="inline-block text-primary-600 font-medium">
            Have a code already? Activate →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Register your gym</h1>
          <p className="text-sm text-slate-600 mt-1">
            Get started with a 30-day free trial after approval.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Gym name" name="gymName" value={form.gymName} onChange={update("gymName")} required />
          <FormField label="Owner's full name" name="ownerName" value={form.ownerName} onChange={update("ownerName")} required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={update("email")} required />
          <FormField label="Phone" name="phone" value={form.phone} onChange={update("phone")} required />
          <FormField label="Gym address" name="address" value={form.address} onChange={update("address")} required />
          <FormField label="Password" name="password" type="password" value={form.password} onChange={update("password")} required />
          <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} required />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
