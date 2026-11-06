import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../lib/api.js";
import Badge from "../../components/ui/Badge.js";
import AdminTable, { type Column } from "../../components/admin/AdminTable.js";
import ActionMenu from "../../components/admin/ActionMenu.js";
import RelativeTime from "../../components/admin/RelativeTime.js";
import { useToast } from "../../components/Toast.js";

interface Gym {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  trialExpiresAt: string | null;
  licenceExpiresAt: string | null;
  createdAt: string;
}

const filters = [
  { key: "", label: "All" },
  { key: "ACTIVE_PAID", label: "Paid" },
  { key: "ACTIVE_TRIAL", label: "Trial" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "TRIAL_EXPIRED", label: "Expired" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "REJECTED", label: "Rejected" },
];

export default function AdminGyms() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [status, setStatus] = useState(params.get("status") || "");
  const [q, setQ] = useState("");
  const [gyms, setGyms] = useState<Gym[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setGyms(null);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (q.trim()) qs.set("q", q.trim());
    qs.set("limit", "100");
    api
      .get<{ gyms: Gym[] }>(`/api/admin/gyms?${qs}`, true)
      .then((res) => setGyms(res.gyms));
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  function handleStatus(s: string) {
    setStatus(s);
    if (s) setParams({ status: s });
    else setParams({});
  }

  async function action(
    gymId: string,
    path: string,
    body: object,
    confirmMsg?: string,
    successMsg?: string
  ) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusyId(gymId);
    try {
      await api.post(`/api/admin/gyms/${gymId}/${path}`, body, true);
      toast.show(successMsg || "Done");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Gym>[] = [
    {
      key: "name",
      header: "Gym",
      render: (g) => (
        <Link
          to={`/admin/gyms/${g.id}`}
          className="block hover:underline"
        >
          <div className="font-medium text-slate-900 truncate max-w-[180px]">
            {g.name}
          </div>
          <div className="text-xs text-slate-500 truncate max-w-[180px]">
            {g.ownerName}
          </div>
        </Link>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (g) => (
        <div>
          <div className="text-xs text-slate-700 truncate max-w-[200px]">
            {g.email}
          </div>
          <div className="text-[11px] text-slate-500">{g.phone}</div>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (g) => <Badge status={g.status} />,
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (g) => {
        const date =
          g.status === "ACTIVE_PAID"
            ? g.licenceExpiresAt
            : g.status === "ACTIVE_TRIAL"
            ? g.trialExpiresAt
            : null;
        return date ? (
          <span className="text-xs text-slate-600">
            {new Date(date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "created",
      header: "Registered",
      render: (g) => (
        <RelativeTime
          date={g.createdAt}
          className="text-xs text-slate-500"
        />
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (g) => (
        <ActionMenu
          items={[
            ...(g.status === "PENDING_APPROVAL"
              ? [
                  {
                    label: "Approve",
                    onClick: () =>
                      action(g.id, "approve", {}, undefined, "Approved"),
                  },
                  {
                    label: "Reject",
                    onClick: () => {
                      const reason = prompt("Reason?");
                      if (reason)
                        action(g.id, "reject", { reason }, undefined, "Rejected");
                    },
                    danger: true,
                  },
                ]
              : []),
            ...(g.status === "APPROVED"
              ? [
                  {
                    label: "Resend activation code",
                    onClick: () =>
                      action(g.id, "resend-code", {}, undefined, "Code sent"),
                  },
                ]
              : []),
            ...(["ACTIVE_TRIAL", "ACTIVE_PAID", "TRIAL_EXPIRED"].includes(
              g.status
            )
              ? [
                  {
                    label: "Suspend",
                    onClick: () => {
                      const reason = prompt("Reason for suspension?");
                      if (reason)
                        action(
                          g.id,
                          "suspend",
                          { reason },
                          undefined,
                          "Suspended"
                        );
                    },
                    danger: true,
                  },
                ]
              : []),
            ...(g.status === "SUSPENDED"
              ? [
                  {
                    label: "Reactivate",
                    onClick: () =>
                      action(g.id, "reactivate", {}, undefined, "Reactivated"),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="sticky top-12 z-10 bg-slate-50/95 backdrop-blur px-4 sm:px-6 py-4 border-b border-slate-200 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Gyms
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {gyms ? `${gyms.length} shown` : "Loading…"}
            </p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by name, email, phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />

        <div className="flex gap-1 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleStatus(f.key)}
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                status === f.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4">
        <AdminTable
          columns={columns}
          rows={gyms || []}
          keyFn={(g) => g.id}
          loading={gyms === null}
          empty={
            <div className="text-sm text-slate-500">
              No gyms match this filter.
              {status && (
                <button
                  onClick={() => handleStatus("")}
                  className="ml-1 text-slate-900 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}