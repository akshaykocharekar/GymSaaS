import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import Skeleton from "../components/ui/Skeleton.js";
import Sheet from "../components/ui/Sheet.js";
import FormField from "../components/FormField.js";
import EmptyState from "../components/ui/EmptyState.js";
import { useToast } from "../components/Toast.js";
import {
  COMPENSATION_TYPE,
  COMPENSATION_TYPE_META,
  MAX_TRAINERS_PER_GYM,
} from "@gymora/shared";

interface Trainer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  joiningDate: string;
  compensationType: string;
  commissionPercent: number;
  monthlySalary: number;
  isActive: boolean;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Trainers() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_TRAINERS");

  const [trainers, setTrainers] = useState<Trainer[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    joiningDate: todayIso(),
    compensationType: "COMMISSION_ONLY" as string,
    commissionPercent: "20",
    monthlySalary: "0",
    notes: "",
  });

  async function load() {
    setTrainers(null);
    try {
      const res = await api.get<{ trainers: Trainer[] }>(
        "/api/gym/trainers",
        true
      );
      setTrainers(res.trainers);
    } catch {
      setTrainers([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm({
      name: "",
      phone: "",
      email: "",
      joiningDate: todayIso(),
      compensationType: "COMMISSION_ONLY",
      commissionPercent: "20",
      monthlySalary: "0",
      notes: "",
    });
    setError(null);
    setSheetOpen(true);
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post(
        "/api/gym/trainers",
        {
          name: form.name,
          phone: form.phone,
          email: form.email || "",
          joiningDate: new Date(form.joiningDate).toISOString(),
          compensationType: form.compensationType,
          commissionPercent: Number(form.commissionPercent),
          monthlySalary: Number(form.monthlySalary),
          notes: form.notes,
        },
        true
      );
      toast.show("Trainer added");
      setSheetOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const showCommissionField =
    form.compensationType === "COMMISSION_ONLY" ||
    form.compensationType === "SALARY_PLUS_COMMISSION";
  const showSalaryField =
    form.compensationType === "SALARY_ONLY" ||
    form.compensationType === "SALARY_PLUS_COMMISSION";

  const atCapacity =
    trainers !== null && trainers.length >= MAX_TRAINERS_PER_GYM;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Trainers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {trainers
              ? `${trainers.length} of ${MAX_TRAINERS_PER_GYM}`
              : "Loading…"}
          </p>
        </div>
        {canManage && !atCapacity && (
          <Button size="sm" onClick={openNew}>
            + Add trainer
          </Button>
        )}
      </div>

      {trainers === null ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
      ) : trainers.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <div className="text-sm text-slate-600 max-w-md mx-auto">
            Add your first trainer to track PT sessions, class packs, and
            commissions.
          </div>
          {canManage && <Button onClick={openNew}>Add trainer</Button>}
        </Card>
      ) : (
        <div className="space-y-2">
          {trainers.map((t) => {
            const meta =
              COMPENSATION_TYPE_META[
                t.compensationType as keyof typeof COMPENSATION_TYPE_META
              ] || COMPENSATION_TYPE_META.COMMISSION_ONLY;
            return (
              <Link key={t.id} to={`/app/trainers/${t.id}`} className="block">
                <Card interactive className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.phone} · {meta.label}
                      {t.commissionPercent > 0 &&
                        t.compensationType !== "SALARY_ONLY" &&
                        ` · ${t.commissionPercent}%`}
                      {t.monthlySalary > 0 &&
                        t.compensationType !== "COMMISSION_ONLY" &&
                        ` · ₹${t.monthlySalary.toLocaleString("en-IN")}/mo`}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add trainer"
      >
        <form onSubmit={create} className="space-y-4 pb-4">
          <FormField
            label="Full name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
          <FormField
            label="Email (optional)"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <FormField
            label="Joining date"
            name="joiningDate"
            type="date"
            value={form.joiningDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, joiningDate: e.target.value }))
            }
            required
          />

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              Compensation
            </div>
            <div className="space-y-2">
              {Object.entries(COMPENSATION_TYPE_META).map(([key, meta]) => (
                <label
                  key={key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                    form.compensationType === key
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="comp"
                    checked={form.compensationType === key}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        compensationType: key,
                        commissionPercent:
                          key === "SALARY_ONLY" ? "0" : f.commissionPercent,
                        monthlySalary:
                          key === "COMMISSION_ONLY" ? "0" : f.monthlySalary,
                      }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {meta.label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {meta.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {showCommissionField && (
            <FormField
              label="Commission %"
              name="commissionPercent"
              type="number"
              value={form.commissionPercent}
              onChange={(e) =>
                setForm((f) => ({ ...f, commissionPercent: e.target.value }))
              }
              required
            />
          )}

          {showSalaryField && (
            <FormField
              label="Monthly salary (₹)"
              name="monthlySalary"
              type="number"
              value={form.monthlySalary}
              onChange={(e) =>
                setForm((f) => ({ ...f, monthlySalary: e.target.value }))
              }
              required
            />
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={busy}>
            Add trainer
          </Button>
        </form>
      </Sheet>
    </div>
  );
}