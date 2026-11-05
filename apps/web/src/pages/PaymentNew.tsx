import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import Button from "../components/ui/Button.js";
import FormField from "../components/FormField.js";
import { useToast } from "../components/Toast.js";

interface Member {
  id: string;
  fullName: string;
  phone: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
}
interface Plan {
  id: string;
  name: string;
  price: number;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaymentNew() {
  const nav = useNavigate();
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    method: "CASH",
    paymentDate: todayIso(),
    note: "",
    holdAsAdvance: false,
  });

  useEffect(() => {
    Promise.all([
      api.get<{ members: Member[] }>("/api/gym/members?limit=200", true),
      api.get<{ plans: Plan[] }>("/api/gym/plans", true),
    ]).then(([m, p]) => {
      setMembers(m.members);
      setPlans(p.plans);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) || m.phone.includes(search.trim())
    );
  }, [members, search]);

  function selectMember(m: Member) {
    const plan = plans.find((p) => p.id === m.planId);
    setForm((f) => ({
      ...f,
      memberId: m.id,
      amount: plan ? String(plan.price) : f.amount,
    }));
    setSearch("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.memberId) {
      setError("Pick a member first");
      return;
    }
    setBusy(true);
    try {
      await api.post(
        "/api/gym/payments",
        {
          memberId: form.memberId,
          amount: Number(form.amount),
          method: form.method,
          paymentDate: new Date(form.paymentDate).toISOString(),
          note: form.note,
          holdAsAdvance: form.holdAsAdvance,
        },
        true
      );
      toast.show("Payment recorded");
      nav("/app/payments", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record");
    } finally {
      setBusy(false);
    }
  }

  const selected = members.find((m) => m.id === form.memberId);

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
        <h1 className="text-lg font-bold text-slate-900">Record payment</h1>
      </div>

      <form onSubmit={onSubmit} className="px-4 sm:px-6 py-4 space-y-4">
        {!selected ? (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Member</label>
            <input
              type="text"
              placeholder="Search name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 mt-2 bg-white">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">No matches</div>
              ) : (
                filtered.slice(0, 20).map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => selectMember(m)}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{m.fullName}</div>
                      <div className="text-xs text-slate-500">{m.phone}</div>
                    </div>
                    <span className="text-xs text-slate-400">{m.status}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-card">
            <div>
              <div className="text-sm font-medium text-slate-900">{selected.fullName}</div>
              <div className="text-xs text-slate-500">{selected.phone}</div>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, memberId: "" }))}
              className="text-xs text-primary-600 font-medium"
            >
              Change
            </button>
          </div>
        )}

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
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          label="Payment date"
          name="paymentDate"
          type="date"
          value={form.paymentDate}
          onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
          required
        />
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
              Adds ₹{form.amount || "0"} to this member's advance balance. Deducted
              automatically on renewal.
            </div>
          </div>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>

      <div className="fixed bottom-20 lg:bottom-0 inset-x-0 lg:left-64 bg-white/95 backdrop-blur border-t border-slate-200 px-4 sm:px-6 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Button onClick={onSubmit} loading={busy} fullWidth size="lg">
          Save payment
        </Button>
      </div>
    </div>
  );
}