import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import KpiCard from "../../components/admin/KpiCard.js";
import Badge from "../../components/ui/Badge.js";
import RelativeTime from "../../components/admin/RelativeTime.js";

interface Stats {
  counts: {
    total: number;
    pending: number;
    approved: number;
    trial: number;
    paid: number;
    expired: number;
    suspended: number;
    rejected: number;
  };
  revenue: { allTime: number; thisMonth: number };
}

interface RecentGym {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentGym[] | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ ok: boolean } & Stats>("/api/admin/stats", true),
      api.get<{ gyms: RecentGym[] }>(
        "/api/admin/gyms?limit=5&offset=0",
        true
      ),
    ]).then(([s, g]) => {
      setStats({ counts: s.counts, revenue: s.revenue });
      setRecent(g.gyms.slice(0, 5));
    });
  }, []);

  const needsAttention =
    (stats?.counts.pending || 0) + (stats?.counts.expired || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Platform health at a glance
        </p>
      </div>

      {/* Attention strip — only if something needs action */}
      {needsAttention > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <div className="text-sm text-amber-900 flex-1 min-w-0">
            {stats!.counts.pending > 0 && (
              <>
                <strong>{stats!.counts.pending}</strong> pending approval
                {stats!.counts.pending > 1 ? "s" : ""}
              </>
            )}
            {stats!.counts.pending > 0 && stats!.counts.expired > 0 && " · "}
            {stats!.counts.expired > 0 && (
              <>
                <strong>{stats!.counts.expired}</strong> expired trial
                {stats!.counts.expired > 1 ? "s" : ""}
              </>
            )}
          </div>
          <div className="flex gap-2 text-xs">
            {stats!.counts.pending > 0 && (
              <Link
                to="/admin/registrations"
                className="px-2.5 py-1 bg-amber-900 text-white rounded font-medium hover:bg-amber-800"
              >
                Review pending
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total gyms"
          value={stats?.counts.total}
          to="/admin/gyms"
        />
        <KpiCard
          label="Paid"
          value={stats?.counts.paid}
          tone="success"
          to="/admin/gyms?status=ACTIVE_PAID"
        />
        <KpiCard
          label="On trial"
          value={stats?.counts.trial}
          tone="default"
          to="/admin/gyms?status=ACTIVE_TRIAL"
        />
        <KpiCard
          label="Pending"
          value={stats?.counts.pending}
          tone="warn"
          to="/admin/registrations"
        />
        <KpiCard
          label="Revenue this month"
          value={stats ? `₹${(stats.revenue.thisMonth / 100).toLocaleString("en-IN")}` : undefined}
        />
        <KpiCard
          label="Revenue all time"
          value={stats ? `₹${(stats.revenue.allTime / 100).toLocaleString("en-IN")}` : undefined}
        />
        <KpiCard
          label="Expired"
          value={stats?.counts.expired}
          tone="danger"
          to="/admin/gyms?status=TRIAL_EXPIRED"
        />
        <KpiCard
          label="Suspended"
          value={stats?.counts.suspended}
          tone="danger"
          to="/admin/gyms?status=SUSPENDED"
        />
      </div>

      {/* Recent gyms */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Recently registered
          </h2>
          <Link
            to="/admin/gyms"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {!recent
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex gap-3">
                  <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
                </div>
              ))
            : recent.map((g) => (
                <Link
                  key={g.id}
                  to={`/admin/gyms/${g.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {g.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {g.email}
                    </div>
                  </div>
                  <Badge status={g.status} />
                  <div className="text-xs text-slate-400 w-16 text-right">
                    <RelativeTime date={g.createdAt} />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}