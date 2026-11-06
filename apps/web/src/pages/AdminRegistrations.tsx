import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import Badge from "../components/ui/Badge.js";
import AdminTable, { type Column } from "../components/admin/AdminTable.js";
import RelativeTime from "../components/admin/RelativeTime.js";
import { useToast } from "../components/Toast.js";

interface PendingGym {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
}

export default function AdminRegistrations() {
  const toast = useToast();
  const [gyms, setGyms] = useState<PendingGym[] | null>(null);
  const [approvalCode, setApprovalCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setGyms(null);
    const res = await api.get<{ gyms: PendingGym[] }>(
      "/api/admin/gyms/pending",
      true
    );
    setGyms(res.gyms);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setBusyId(id);
    try {
      const res = await api.post<{ activationCode: string }>(
        `/api/admin/gyms/${id}/approve`,
        {},
        true
      );
      setApprovalCode(res.activationCode);
      toast.show("Approved");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    setBusyId(id);
    try {
      await api.post(`/api/admin/gyms/${id}/reject`, { reason }, true);
      toast.show("Rejected");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<PendingGym>[] = [
    {
      key: "name",
      header: "Gym",
      render: (g) => (
        <Link to={`/admin/gyms/${g.id}`} className="hover:underline block">
          <div className="text-sm font-medium text-slate-900">{g.name}</div>
          <div className="text-xs text-slate-500">{g.ownerName}</div>
        </Link>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (g) => (
        <div>
          <div className="text-xs text-slate-700">{g.email}</div>
          <div className="text-[11px] text-slate-500">{g.phone}</div>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "address",
      header: "Address",
      hideOnMobile: true,
      render: (g) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-[200px]">
          {g.address}
        </span>
      ),
    },
    {
      key: "created",
      header: "Registered",
      hideOnMobile: true,
      render: (g) => (
        <RelativeTime date={g.createdAt} className="text-xs text-slate-500" />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (g) => (
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => approve(g.id)}
            disabled={busyId === g.id}
            className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={() => reject(g.id)}
            disabled={busyId === g.id}
            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Pending approvals
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {gyms ? `${gyms.length} awaiting review` : "Loading…"}
        </p>
      </div>

      {approvalCode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
            New activation code
          </div>
          <div className="mt-1 font-mono text-lg text-emerald-900 select-all">
            {approvalCode}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(approvalCode);
              toast.show("Copied");
            }}
            className="mt-1 text-xs text-emerald-700 hover:underline font-medium"
          >
            Copy
          </button>
        </div>
      )}

      <AdminTable
        columns={columns}
        rows={gyms || []}
        keyFn={(g) => g.id}
        loading={gyms === null}
        empty={
          <div className="text-sm text-slate-500">
            No pending registrations. You&apos;re all caught up.
          </div>
        }
      />
    </div>
  );
}