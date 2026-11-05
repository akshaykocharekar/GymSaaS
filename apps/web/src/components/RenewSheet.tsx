import { FormEvent, useEffect, useState } from "react";
import Sheet from "./ui/Sheet.js";
import FormField from "./FormField.js";
import Button from "./ui/Button.js";
import { api, ApiError } from "../lib/api.js";
import { useToast } from "./Toast.js";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  memberId: string;
  currentPlanId: string;
  currentAdvanceBalance: number;
  onSuccess: () => void;
}

export default function RenewSheet({
  open,
  onClose,
  memberId,
  currentPlanId,
  currentAdvanceBalance,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({
    planId: currentPlanId,
    method: "CASH" as "CASH" | "UPI" | "OTHER",
    useAdvance: false,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get<{ plans: Plan[] }>("/api/gym/plans", true).then((res) => {
      setPlans(res.plans);
      const cur = res.plans.find((p) => p.id === currentPlanId) || res.plans[0];
      if (cur) setForm((f) => ({ ...f, planId: cur.id }));
    });
    // Auto-suggest applying balance if member has any
    if (currentAdvanceBalance > 0) {
      setForm((f) => ({ ...f, useAdvance: true }));
    }
  }, [open, currentPlanId, currentAdvanceBalance]);

  const plan = plans.find((p) => p.id === form.planId);
  const planPrice = plan?.price || 0;
  const advanceApplied = form.useAdvance
    ? Math.min(currentAdvanceBalance, planPrice)
    : 0;
  const remainingToPay = planPrice - advanceApplied;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(
        `/api/gym/members/${memberId}/renew`,
        {
          planId: form.planId,
          paymentMethod: form.method,
          useAdvanceBalance: form.useAdvance,
        },
        true
      );
      toast.show("Membership renewed");
      onSuccess();
      onClose();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Renew membership">
      <form onSubmit={submit} className="space-y-4 pb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Plan</label>
          <select
            value={form.planId}
            onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.durationDays}d · ₹{p.price}
              </option>
            ))}
          </select>
        </div>

        {currentAdvanceBalance > 0 && (
          <label className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.useAdvance}
              onChange={(e) =>
                setForm((f) => ({ ...f, useAdvance: e.target.checked }))
              }
              className="mt-0.5 rounded border-slate-300"
            />
            <div>
              <div className="text-sm font-medium text-amber-900">
                Use advance balance (₹{currentAdvanceBalance})
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                Applies up to ₹{Math.min(currentAdvanceBalance, planPrice)} from
                this member's advance against the ₹{planPrice} plan price.
              </div>
            </div>
          </label>
        )}

        <div className="bg-slate-50 rounded-lg p-4 space-y-1.5">
          <Row label="Plan price" value={`₹${planPrice}`} />
          {advanceApplied > 0 && (
            <Row label="From advance" value={`− ₹${advanceApplied}`} accent="text-amber-700" />
          )}
          <div className="border-t border-slate-200 pt-1.5 mt-1.5">
            <Row
              label="Collect now"
              value={`₹${remainingToPay}`}
              accent="text-slate-900 font-semibold"
            />
          </div>
        </div>

        {remainingToPay > 0 && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Method</label>
            <div className="flex gap-2">
              {(["CASH", "UPI", "OTHER"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setForm((f) => ({ ...f, method: m }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    form.method === m
                      ? "bg-primary-600 text-white"
                      : "bg-white text-slate-700 border border-slate-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={busy}>
          {remainingToPay > 0 ? `Renew · collect ₹${remainingToPay}` : "Renew · use advance"}
        </Button>
      </form>
    </Sheet>
  );
}

function Row({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={accent || "text-slate-900 font-medium"}>{value}</span>
    </div>
  );
}