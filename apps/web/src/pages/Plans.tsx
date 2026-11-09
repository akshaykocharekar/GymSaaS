import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import Sheet from "../components/ui/Sheet.js";
import FormField from "../components/FormField.js";
import Skeleton from "../components/ui/Skeleton.js";
import { useToast } from "../components/Toast.js";

interface Plan {
  id: string;
  name: string;
  type: string;
  durationDays: number;
  price: number;
  isActive: boolean;
}

export default function Plans() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_PLANS");

  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [editing, setEditing] = useState<Plan | "new" | null>(null);
  const [form, setForm] = useState({ name: "", durationDays: "30", price: "1000" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.get<{ plans: Plan[] }>("/api/gym/plans", true);
    setPlans(res.plans);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    if (!canManage) return;
    setForm({ name: "", durationDays: "30", price: "1000" });
    setEditing("new");
  }

  function openEdit(p: Plan) {
    if (!canManage) return;
    setForm({
      name: p.name,
      durationDays: String(p.durationDays),
      price: String(p.price),
    });
    setEditing(p);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        type: "CUSTOM",
      };
      if (editing === "new") {
        await api.post("/api/gym/plans", payload, true);
        toast.show("Plan created");
      } else if (editing) {
        await api.patch(`/api/gym/plans/${editing.id}`, payload, true);
        toast.show("Plan updated");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Membership durations and prices
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={openNew}>
            + New plan
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {!plans
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
          : plans.map((p) => (
              <Card
                key={p.id}
                interactive={canManage}
                className="p-4 flex items-center justify-between"
                onClick={canManage ? () => openEdit(p) : undefined}
              >
                <div>
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.durationDays} days · ₹{p.price}
                  </div>
                </div>
                {canManage && (
                  <svg
                    className="w-5 h-5 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </Card>
            ))}
      </div>

      <Sheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New plan" : "Edit plan"}
      >
        <form onSubmit={save} className="space-y-4 pb-4">
          <FormField
            label="Plan name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <FormField
            label="Duration (days)"
            name="durationDays"
            type="number"
            value={form.durationDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, durationDays: e.target.value }))
            }
            required
          />
          <FormField
            label="Price (₹)"
            name="price"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={busy}>
            Save
          </Button>
        </form>
      </Sheet>
    </div>
  );
}