import { FormEvent, useEffect, useState } from "react";
import Sheet from "./ui/Sheet.js";
import Button from "./ui/Button.js";
import FormField from "./FormField.js";
import { api, ApiError } from "../lib/api.js";
import { useToast } from "./Toast.js";

interface Props {
  open: boolean;
  onClose: () => void;
  trainerId: string;
  monthlySalary: number;
  monthCommission: number;
  onSuccess: () => void;
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function PayTrainerSheet({
  open,
  onClose,
  trainerId,
  monthlySalary,
  monthCommission,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    period: currentPeriod(),
    salaryComponent: String(monthlySalary),
    commissionComponent: String(monthCommission),
    amount: String(monthlySalary + monthCommission),
    paidOn: todayIso(),
    paymentMethod: "CASH",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      period: currentPeriod(),
      salaryComponent: String(monthlySalary),
      commissionComponent: String(monthCommission),
      amount: String(monthlySalary + monthCommission),
      paidOn: todayIso(),
      paymentMethod: "CASH",
      notes: "",
    });
  }, [open, monthlySalary, monthCommission]);

  // Keep amount in sync when components change
  function updateComponent(
    key: "salaryComponent" | "commissionComponent",
    value: string
  ) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      const sum =
        Number(next.salaryComponent || 0) + Number(next.commissionComponent || 0);
      next.amount = String(sum);
      return next;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post(
        "/api/gym/payouts",
        {
          trainerId,
          amount: Number(form.amount),
          period: form.period,
          salaryComponent: Number(form.salaryComponent || 0),
          commissionComponent: Number(form.commissionComponent || 0),
          paidOn: new Date(form.paidOn).toISOString(),
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        },
        true
      );
      toast.show("Payout recorded");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Pay trainer">
      <form onSubmit={submit} className="space-y-4 pb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Period
          </label>
          <input
            type="month"
            value={form.period}
            onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            required
          />
        </div>

        <FormField
          label="Salary component (₹)"
          name="salaryComponent"
          type="number"
          value={form.salaryComponent}
          onChange={(e) => updateComponent("salaryComponent", e.target.value)}
        />

        <FormField
          label="Commission component (₹)"
          name="commissionComponent"
          type="number"
          value={form.commissionComponent}
          onChange={(e) =>
            updateComponent("commissionComponent", e.target.value)
          }
        />

        <FormField
          label="Total amount paid (₹)"
          name="amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
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
                  setForm((f) => ({ ...f, paymentMethod: m }))
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  form.paymentMethod === m
                    ? "bg-primary-600 text-white"
                    : "bg-white text-slate-700 border border-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Paid on"
          name="paidOn"
          type="date"
          value={form.paidOn}
          onChange={(e) => setForm((f) => ({ ...f, paidOn: e.target.value }))}
          required
        />

        <FormField
          label="Notes (optional)"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button type="submit" fullWidth size="lg" loading={busy}>
          Record payout
        </Button>
      </form>
    </Sheet>
  );
}