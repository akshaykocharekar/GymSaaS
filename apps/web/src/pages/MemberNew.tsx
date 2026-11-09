import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import FormField from "../components/FormField.js";
import Button from "../components/ui/Button.js";
import { useToast } from "../components/Toast.js";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function MemberNew() {
  const nav = useNavigate();
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    joiningDate: todayIso(),
    planId: "",
    membershipStartDate: todayIso(),
    notes: "",
    collectPayment: true,
    initialPaymentAmount: "",
    initialPaymentMethod: "CASH" as "CASH" | "UPI" | "OTHER",
  });

  useEffect(() => {
    api.get<{ plans: Plan[] }>("/api/gym/plans", true).then((res) => {
      setPlans(res.plans);
      if (res.plans.length > 0) {
        const first = res.plans[0];
        setForm((f) => ({
          ...f,
          planId: first.id,
          initialPaymentAmount: String(first.price),
        }));
      }
    });
  }, []);

  function update<K extends keyof typeof form>(k: K) {
    return (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function updatePlan(planId: string) {
    const plan = plans?.find((p) => p.id === planId);
    setForm((f) => ({
      ...f,
      planId,
      initialPaymentAmount: plan ? String(plan.price) : f.initialPaymentAmount,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post(
        "/api/gym/members",
        {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          joiningDate: new Date(form.joiningDate).toISOString(),
          planId: form.planId,
          membershipStartDate: new Date(form.membershipStartDate).toISOString(),
          notes: form.notes,
          collectPayment: form.collectPayment,
          initialPaymentAmount:
            form.collectPayment && form.initialPaymentAmount
              ? Number(form.initialPaymentAmount)
              : undefined,
          initialPaymentMethod: form.initialPaymentMethod,
        },
        true
      );
      toast.show(
        form.collectPayment ? "Member added + payment recorded" : "Member added"
      );
      nav("/app/members", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add member");
    } finally {
      setBusy(false);
    }
  }

  const selectedPlan = plans?.find((p) => p.id === form.planId);

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200/60 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900">Add member</h1>
      </div>

      <form onSubmit={onSubmit} className="px-4 sm:px-6 py-4 space-y-4">
        <FormField label="Full name" name="fullName" value={form.fullName} onChange={update("fullName")} required />
        <FormField label="Phone" name="phone" value={form.phone} onChange={update("phone")} required />
        <FormField label="Email (optional)" name="email" type="email" value={form.email} onChange={update("email")} />
        <FormField label="Address (optional)" name="address" value={form.address} onChange={update("address")} />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Plan</label>
          <select
            value={form.planId}
            onChange={(e) => updatePlan(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {!plans ? (
              <option>Loading…</option>
            ) : (
              plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.durationDays}d · ₹{p.price}
                </option>
              ))
            )}
          </select>
        </div>

        <FormField label="Joining date" name="joiningDate" type="date" value={form.joiningDate} onChange={update("joiningDate")} required />
        <FormField label="Membership start" name="membershipStartDate" type="date" value={form.membershipStartDate} onChange={update("membershipStartDate")} required />
        <FormField label="Notes (optional)" name="notes" value={form.notes} onChange={update("notes")} />

        {/* Payment section */}
        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.collectPayment}
              onChange={(e) =>
                setForm((f) => ({ ...f, collectPayment: e.target.checked }))
              }
              className="mt-0.5 rounded border-slate-300"
            />
            <div>
              <div className="text-sm font-medium text-emerald-900">
                Collect payment now
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Records{" "}
                {selectedPlan
                  ? `₹${selectedPlan.price}`
                  : "the plan price"}{" "}
                as a payment for this membership.
              </div>
            </div>
          </label>

          {form.collectPayment && (
            <div className="mt-3 space-y-3">
              <FormField
                label="Amount collected (₹)"
                name="initialPaymentAmount"
                type="number"
                value={form.initialPaymentAmount}
                onChange={update("initialPaymentAmount")}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Payment method
                </label>
                <div className="flex gap-2">
                  {(["CASH", "UPI", "OTHER"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() =>
                        setForm((f) => ({ ...f, initialPaymentMethod: m }))
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.initialPaymentMethod === m
                          ? "bg-primary-600 text-white"
                          : "bg-white text-slate-700 border border-slate-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>

      <div className="fixed bottom-20 lg:bottom-0 inset-x-0 lg:left-64 bg-white/95 backdrop-blur border-t border-slate-200 px-4 sm:px-6 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Button onClick={onSubmit} loading={busy} fullWidth size="lg">
          Save member
        </Button>
      </div>
    </div>
  );
}