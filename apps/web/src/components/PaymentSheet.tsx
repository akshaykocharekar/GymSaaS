import { FormEvent, useEffect, useState } from "react";
import Sheet from "./ui/Sheet.js";
import FormField from "./FormField.js";
import Button from "./ui/Button.js";
import { api, ApiError } from "../lib/api.js";
import { useToast } from "./Toast.js";

interface Props {
  open: boolean;
  onClose: () => void;
  memberId: string;
  defaultAmount: number;
  onSuccess: () => void;
}

export default function PaymentSheet({
  open,
  onClose,
  memberId,
  defaultAmount,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [form, setForm] = useState({
    amount: String(defaultAmount ?? 0),
    method: "CASH" as "CASH" | "UPI" | "OTHER",
    note: "",
    holdAsAdvance: false,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        amount: String(defaultAmount ?? 0),
        method: "CASH",
        note: "",
        holdAsAdvance: false,
      });
    }
  }, [open, defaultAmount]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(
        "/api/gym/payments",
        {
          memberId,
          amount: Number(form.amount),
          method: form.method,
          paymentDate: new Date().toISOString(),
          note: form.note,
          holdAsAdvance: form.holdAsAdvance,
        },
        true
      );
      toast.show("Payment recorded");
      onSuccess();
      onClose();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  const displayAmount = form.amount || "0";

  return (
    <Sheet open={open} onClose={onClose} title="Record payment">
      <form onSubmit={submit} className="space-y-4 pb-4">
        <FormField
          label="Amount (₹)"
          name="amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
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
        <FormField
          label="Note (optional)"
          name="note"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
        <label className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={form.holdAsAdvance}
            onChange={(e) =>
              setForm((f) => ({ ...f, holdAsAdvance: e.target.checked }))
            }
            className="mt-0.5 rounded border-slate-300"
          />
          <div>
            <div className="text-sm font-medium text-amber-900">
              Hold as advance for next renewal
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              Adds ₹{displayAmount} to this member's advance balance. It will be
              deducted automatically when you renew.
            </div>
          </div>
        </label>
        <Button type="submit" fullWidth size="lg" loading={busy}>
          Save
        </Button>
      </form>
    </Sheet>
  );
}
