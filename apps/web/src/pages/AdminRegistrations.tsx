import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { api, ApiError } from "../lib/api.js";

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

interface ApprovalResponse {
  ok: boolean;
  activationCode: string;
  expiresAt: string;
  email: string;
  phone: string;
}

export default function AdminRegistrations() {
  const { logout, user } = useAuth();
  const [gyms, setGyms] = useState<PendingGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ ok: boolean; gyms: PendingGym[] }>(
        "/api/admin/gyms/pending",
        true
      );
      setGyms(res.gyms);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await api.post<ApprovalResponse>(
        `/api/admin/gyms/${id}/approve`,
        {},
        true
      );
      setApproval(res);
      setGyms((g) => g.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approval failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    setBusyId(id);
    setError(null);
    try {
      await api.post(`/api/admin/gyms/${id}/reject`, { reason }, true);
      setGyms((g) => g.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Rejection failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-bold text-primary-600 text-lg">Gymora Admin</div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-danger"
        >
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pending registrations</h1>
          <button
            onClick={load}
            className="text-sm text-primary-600 font-medium"
          >
            Refresh
          </button>
        </div>

        {approval && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="font-medium text-green-800">
              Approved! Share this activation code with the gym:
            </div>
            <div className="font-mono text-xl bg-white border border-green-300 px-3 py-2 rounded inline-block">
              {approval.activationCode}
            </div>
            <div className="text-xs text-slate-600">
              Expires {new Date(approval.expiresAt).toLocaleString()}. Sent to{" "}
              {approval.email}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(approval.activationCode)}
              className="text-xs text-primary-600 font-medium"
            >
              Copy code
            </button>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : gyms.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-slate-500">
            No pending registrations.
          </div>
        ) : (
          <div className="space-y-3">
            {gyms.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-lg p-4 shadow-sm space-y-2"
              >
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-slate-600">
                  {g.ownerName} · {g.email} · {g.phone}
                </div>
                <div className="text-sm text-slate-500">{g.address}</div>
                <div className="text-xs text-slate-400">
                  Registered {new Date(g.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => approve(g.id)}
                    disabled={busyId === g.id}
                    className="px-3 py-1.5 rounded bg-success text-white text-sm font-medium disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(g.id)}
                    disabled={busyId === g.id}
                    className="px-3 py-1.5 rounded bg-danger text-white text-sm font-medium disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}