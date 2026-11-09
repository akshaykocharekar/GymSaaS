import { FormEvent, useEffect, useState } from "react";
import Sheet from "./ui/Sheet.js";
import Button from "./ui/Button.js";
import FormField from "./FormField.js";
import { api, ApiError } from "../lib/api.js";
import { useToast } from "./Toast.js";
import { SESSION_PACK_TYPE_META } from "@gymora/shared";

interface Trainer {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  memberId: string;
  onSuccess: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddSessionPackSheet({
  open,
  onClose,
  memberId,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "PT",
    trainerId: "",
    sessionsPurchased: "10",
    pricePaid: "5000",
    paymentMethod: "CASH",
    purchasedAt: todayIso(),
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    api
      .get<{ trainers: Trainer[] }>("/api/gym/trainers", true)
      .then((res) => setTrainers(res.trainers))
      .catch(() => setTrainers([]));
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post(
        "/api/gym/trainers/session-packs",
        {
          memberId,
          trainerId: form.trainerId || "",
          type: form.type,
          sessionsPurchased: Number(form.sessionsPurchased),
          pricePaid: Number(form.pricePaid),
          paymentMethod: form.paymentMethod,
          purchasedAt: new Date(form.purchasedAt).toISOString(),
          notes: form.notes,
        },
        true
      );
      toast.show("Session pack added");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add session pack">
      <form onSubmit={submit} className="space-y-4 pb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Session type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            {Object.entries(SESSION_PACK_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {trainers.length > 0 && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Trainer (optional)
            </label>
            <select
              value={form.trainerId}
              onChange={(e) =>
                setForm((f) => ({ ...f, trainerId: e.target.value }))
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="">No trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <FormField
          label="Sessions"
          name="sessionsPurchased"
          type="number"
          value={form.sessionsPurchased}
          onChange={(e) =>
            setForm((f) => ({ ...f, sessionsPurchased: e.target.value }))
          }
          required
        />
        <FormField
          label="Price (₹)"
          name="pricePaid"
          type="number"
          value={form.pricePaid}
          onChange={(e) =>
            setForm((f) => ({ ...f, pricePaid: e.target.value }))
          }
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
          label="Purchase date"
          name="purchasedAt"
          type="date"
          value={form.purchasedAt}
          onChange={(e) =>
            setForm((f) => ({ ...f, purchasedAt: e.target.value }))
          }
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
          Save pack
        </Button>
        <p className="text-xs text-slate-500 text-center">
          A matching payment will be recorded automatically.
        </p>
      </form>
    </Sheet>
  );
}