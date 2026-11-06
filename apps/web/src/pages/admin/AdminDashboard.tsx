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
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Overview
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Platform health at a glance
        </p>
      </div>

      {/* Attention strip — only if something needs action */}
      {needsAttention > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3.5 flex flex-wrap items-center gap-3">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <div className="text-sm text-amber-100/90 flex-1 min-w-0">
            {stats!.counts.pending > 0 && (
              <>
                <strong className="font-semibold text-white">{stats!.counts.pending}</strong> pending approval
                {stats!.counts.pending > 1 ? "s" : ""}
              </>
            )}
            {stats!.counts.pending > 0 && stats!.counts.expired > 0 && " · "}
            {stats!.counts.expired > 0 && (
              <>
                <strong className="font-semibold text-white">{stats!.counts.expired}</strong> expired trial
                {stats!.counts.expired > 1 ? "s" : ""}
              </>
            )}
          </div>
          <div className="flex gap-2 text-xs">
            {stats!.counts.pending > 0 && (
              <Link
                to="/admin/registrations"
                className="rounded-full bg-amber-300 px-3.5 py-1.5 font-semibold text-amber-950 transition hover:bg-amber-200 active:scale-[0.98]"
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
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">
            Recently registered
          </h2>
          <Link
            to="/admin/gyms"
            className="text-xs font-medium text-orange-300 transition-colors hover:text-orange-200"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
          {!recent
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="h-4 bg-white/[0.06] rounded-lg flex-1 animate-pulse" />
                </div>
              ))
            : recent.map((g) => (
                <Link
                  key={g.id}
                  to={`/admin/gyms/${g.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {g.name}
                    </div>
                    <div className="text-xs text-stone-500 truncate">
                      {g.email}
                    </div>
                  </div>
                  <Badge status={g.status} />
                  <div className="text-xs text-stone-500 w-16 text-right">
                    <RelativeTime date={g.createdAt} />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}