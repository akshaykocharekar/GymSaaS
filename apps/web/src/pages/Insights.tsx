import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Skeleton from "../components/ui/Skeleton.js";

interface Insights {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    momChangePct: number;
    thisMonthMembership: number;
    thisMonthSession: number;
  };
  retention: {
    renewalsThisMonth: number;
    renewedMembers: number;
    retentionPct: number | null;
  };
  arpu: number;
  collectionRate: number | null;
  activeMemberCount: number;
  topMembers: { memberId: string; name: string; phone: string; lifetimeValue: number }[];
  trainerRoi: {
    trainerId: string;
    name: string;
    packs: number;
    revenue: number;
    cost: number;
    roi: number | null;
  }[];
  revenueByPlan: { planName: string; revenue: number; memberCount: number }[];
  monthlyTrend: { label: string; total: number }[];
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Compact labels for chart columns: 1.3L / 98k
function compact(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function Insights() {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    api.get<{ ok: boolean } & Insights>("/api/gym/insights", true).then((res) => {
      setData({
        revenue: res.revenue,
        retention: res.retention,
        arpu: res.arpu,
        collectionRate: res.collectionRate,
        activeMemberCount: res.activeMemberCount,
        topMembers: res.topMembers,
        trainerRoi: res.trainerRoi,
        revenueByPlan: res.revenueByPlan,
        monthlyTrend: res.monthlyTrend,
      });
    });
  }, []);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-36 w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const maxTrend = Math.max(...data.monthlyTrend.map((t) => t.total), 1);
  const maxPlan = Math.max(...data.revenueByPlan.map((p) => p.revenue), 1);
  const { revenue, retention } = data;

  const splitTotal = revenue.thisMonthMembership + revenue.thisMonthSession;
  const membershipPct = splitTotal > 0 ? (revenue.thisMonthMembership / splitTotal) * 100 : 0;

  const deltaClass =
    revenue.momChangePct > 0
      ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25"
      : revenue.momChangePct < 0
      ? "bg-rose-400/10 text-rose-300 ring-rose-400/25"
      : "bg-white/[0.04] text-stone-400 ring-white/10";

  const retentionClass =
    retention.retentionPct !== null && retention.retentionPct >= 70
      ? "text-emerald-300"
      : "text-white";
  const collectionClass =
    data.collectionRate === null
      ? "text-white"
      : data.collectionRate >= 80
      ? "text-emerald-300"
      : data.collectionRate < 60
      ? "text-rose-300"
      : "text-white";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Insights</h1>
        <p className="text-sm text-stone-500 mt-1">Business metrics that matter</p>
      </div>

      {/* Hero: revenue this month */}
      <section>
        <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
          Revenue this month
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            {fmt(revenue.thisMonth)}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${deltaClass}`}
          >
            {revenue.momChangePct !== 0
              ? `${revenue.momChangePct > 0 ? "+" : ""}${revenue.momChangePct}% vs last month`
              : "same as last month"}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-stone-500">Last month: {fmt(revenue.lastMonth)}</p>

        {splitTotal > 0 && (
          <div className="mt-5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-300"
                style={{ width: `${membershipPct}%` }}
              />
              <div className="h-full flex-1 bg-amber-200/50" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-stone-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Memberships
                <span className="font-medium text-stone-200">{fmt(revenue.thisMonthMembership)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-200/70" />
                Sessions
                <span className="font-medium text-stone-200">{fmt(revenue.thisMonthSession)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Supporting stats: one strip, divided, no boxes */}
      <section className="grid grid-cols-3 divide-x divide-white/5 border-y border-white/5 py-4">
        <div className="pr-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">ARPU</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-white">
            {fmt(data.arpu)}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            per active member ({data.activeMemberCount} active)
          </div>
        </div>
        <div className="px-3 sm:px-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Retention
          </div>
          <div className={`mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight ${retentionClass}`}>
            {retention.retentionPct !== null ? `${retention.retentionPct}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {retention.renewedMembers} renewed this month
          </div>
        </div>
        <div className="pl-3 sm:pl-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Collection
          </div>
          <div className={`mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight ${collectionClass}`}>
            {data.collectionRate !== null ? `${data.collectionRate}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-stone-500">of expected this month</div>
        </div>
      </section>

      {/* Monthly trend: vertical columns */}
      <section>
        <h2 className="font-semibold text-white">Revenue trend</h2>
        <p className="text-sm text-stone-500 mt-1">Last 6 months, in ₹</p>
        <div className="mt-5 flex items-end gap-2 sm:gap-4">
          {data.monthlyTrend.map((t) => {
            const isPeak = t.total === maxTrend && t.total > 0;
            return (
              <div
                key={t.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                title={fmt(t.total)}
              >
                <div className={`text-[11px] font-medium ${isPeak ? "text-orange-300" : "text-stone-400"}`}>
                  {compact(t.total)}
                </div>
                <div className="flex h-36 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg bg-gradient-to-t ${
                      isPeak
                        ? "from-orange-500 to-amber-300 shadow-lg shadow-orange-500/30"
                        : "from-orange-500/40 to-orange-400/60"
                    }`}
                    style={{ height: `${Math.max((t.total / maxTrend) * 100, 2)}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-500 truncate max-w-full">{t.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top members */}
      <section className="border-t border-white/5 pt-6">
        <h2 className="font-semibold text-white">Top 10 members by lifetime value</h2>
        {data.topMembers.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No payments recorded yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-white/5">
            {data.topMembers.map((m, i) => (
              <div
                key={m.memberId}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      i === 0
                        ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950"
                        : "bg-white/[0.06] text-stone-300 ring-1 ring-white/10"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-stone-200 truncate">{m.name}</div>
                    <div className="text-xs text-stone-500">{m.phone}</div>
                  </div>
                </div>
                <div className="font-semibold text-white shrink-0">{fmt(m.lifetimeValue)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Revenue by plan */}
      <section className="border-t border-white/5 pt-6">
        <h2 className="font-semibold text-white">Revenue by plan</h2>
        {data.revenueByPlan.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No plans with revenue.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {data.revenueByPlan.map((p) => (
              <div key={p.planName}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-stone-200 truncate">{p.planName}</div>
                    <div className="text-xs text-stone-500">{p.memberCount} members</div>
                  </div>
                  <div className="font-semibold text-white shrink-0">{fmt(p.revenue)}</div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500/60 to-orange-300"
                    style={{ width: `${Math.max((p.revenue / maxPlan) * 100, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trainer ROI */}
      <section className="border-t border-white/5 pt-6">
        <h2 className="font-semibold text-white">Trainer ROI</h2>
        <p className="text-sm text-stone-500 mt-1">Last 6 months</p>
        {data.trainerRoi.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No trainers yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-white/5">
            {data.trainerRoi.map((t) => (
              <div key={t.trainerId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-200 truncate">{t.name}</div>
                  <div className="text-xs text-stone-500">
                    {t.packs} packs · revenue {fmt(t.revenue)} · cost {fmt(t.cost)}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold shrink-0 ${
                    t.roi === null
                      ? "text-stone-600"
                      : t.roi >= 150
                      ? "text-emerald-300"
                      : t.roi >= 80
                      ? "text-amber-300"
                      : "text-rose-300"
                  }`}
                >
                  {t.roi !== null ? `${t.roi}% ROI` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}