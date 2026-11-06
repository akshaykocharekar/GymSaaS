import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import Badge from "../components/ui/Badge.js";
import Skeleton from "../components/ui/Skeleton.js";
import Sheet from "../components/ui/Sheet.js";
import FormField from "../components/FormField.js";
import EmptyState from "../components/ui/EmptyState.js";
import { useToast } from "../components/Toast.js";
import { PERMISSIONS } from "@gymora/shared";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  status: string;
  permissions: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

const PERMISSION_LABELS: Record<string, { label: string; hint: string }> = {
  MANAGE_MEMBERS: {
    label: "Manage members",
    hint: "Add, edit, and deactivate members",
  },
  RECORD_PAYMENTS: {
    label: "Record payments",
    hint: "Log payments and renewals",
  },
  VIEW_REPORTS: {
    label: "View reports",
    hint: "See revenue, dues, and distribution",
  },
};

export default function Staff() {
  const toast = useToast();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [] as string[],
  });

  const isOwner = user?.role === "OWNER";
  const activeCount = staff?.filter((s) => s.status === "ACTIVE").length ?? 0;
  const atCapacity = activeCount >= 10;

  async function load() {
    setStaff(null);
    try {
      const res = await api.get<{ staff: StaffMember[] }>(
        "/api/gym/staff",
        true
      );
      setStaff(res.staff);
    } catch {
      setStaff([]);
    }
  }

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner]);

  function togglePerm(p: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x) => x !== p)
        : [...f.permissions, p],
    }));
  }

  async function createStaff(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post(
        "/api/gym/staff",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          permissions: form.permissions,
        },
        true
      );
      toast.show("Staff account created");
      setSheetOpen(false);
      setForm({ name: "", email: "", password: "", permissions: [] });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function updatePermissions(id: string, permissions: string[]) {
    try {
      await api.patch(`/api/gym/staff/${id}`, { permissions }, true);
      toast.show("Permissions updated");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    }
  }

  async function disable(id: string) {
    if (!confirm("Disable this staff account?")) return;
    try {
      await api.delete(`/api/gym/staff/${id}`, true);
      toast.show("Staff disabled");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    }
  }

  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState
          title="Owner only"
          description="Staff management is only available to the gym owner."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Staff
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Up to 10 staff accounts
          </p>
        </div>
        {staff !== null && (
          <button
            onClick={() => {
              if (atCapacity) {
                alert(
                  "You already have an active staff account. Disable it first to add a new one."
                );
                return;
              }
              setSheetOpen(true);
            }}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              atCapacity
                ? "bg-slate-200 text-slate-600 cursor-not-allowed border border-slate-300"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            + Add staff
          </button>
        )}
      </div>

      {staff === null ? (
        <Skeleton className="h-24 w-full" />
      ) : staff.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <div className="text-sm text-slate-600 max-w-md mx-auto">
            Add a staff member so your receptionist or manager can manage
            members and record payments — with permissions you control.
          </div>
          <Button onClick={() => setSheetOpen(true)}>Add staff account</Button>
        </Card>
      ) : (
        <>
          {staff.map((s) => (
            <Card key={s.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-sm text-slate-600">{s.email}</div>
                  <div className="mt-1">
                    <Badge status={s.status} />
                  </div>
                </div>
                {s.status === "ACTIVE" && (
                  <button
                    onClick={() => disable(s.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Disable
                  </button>
                )}
              </div>

              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Permissions
                </div>
                <div className="space-y-2">
                  {Object.values(PERMISSIONS).map((p) => {
                    const info = PERMISSION_LABELS[p];
                    const enabled = s.permissions.includes(p);
                    return (
                      <label
                        key={p}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => {
                            const next = enabled
                              ? s.permissions.filter((x) => x !== p)
                              : [...s.permissions, p];
                            updatePermissions(s.id, next);
                          }}
                          className="mt-0.5 rounded border-slate-300"
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {info.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {info.hint}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}

          {atCapacity && (
            <Card className="p-4 bg-slate-50">
              <p className="text-xs text-slate-600">
                You&apos;ve reached the staff limit (10 per gym). Disable the
                current account to add a new one.
              </p>
            </Card>
          )}
        </>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add staff account"
      >
        <form onSubmit={createStaff} className="space-y-4 pb-4">
          <FormField
            label="Full name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              Permissions
            </div>
            <div className="space-y-1.5">
              {Object.values(PERMISSIONS).map((p) => {
                const info = PERMISSION_LABELS[p];
                return (
                  <label
                    key={p}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(p)}
                      onChange={() => togglePerm(p)}
                      className="mt-0.5 rounded border-slate-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {info.label}
                      </div>
                      <div className="text-xs text-slate-500">{info.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={busy}>
            Create staff account
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
