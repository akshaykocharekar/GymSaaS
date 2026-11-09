import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Card from "../components/ui/Card.js";
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const maxTrend = Math.max(...data.monthlyTrend.map((t) => t.total), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Business metrics that matter
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Revenue this month"
          value={fmt(data.revenue.thisMonth)}
          hint={
            data.revenue.momChangePct !== 0
              ? `${data.revenue.momChangePct > 0 ? "+" : ""}${data.revenue.momChangePct}% vs last month`
              : "same as last month"
          }
          tone={data.revenue.momChangePct > 0 ? "success" : data.revenue.momChangePct < 0 ? "danger" : "default"}
        />
        <KpiCard
          label="ARPU"
          value={fmt(data.arpu)}
          hint={`per active member (${data.activeMemberCount} active)`}
        />
        <KpiCard
          label="Retention"
          value={data.retention.retentionPct !== null ? `${data.retention.retentionPct}%` : "—"}
          hint={`${data.retention.renewedMembers} renewed this month`}
          tone={data.retention.retentionPct !== null && data.retention.retentionPct >= 70 ? "success" : "default"}
        />
        <KpiCard
          label="Collection rate"
          value={data.collectionRate !== null ? `${data.collectionRate}%` : "—"}
          hint="of expected this month"
          tone={data.collectionRate !== null && data.collectionRate >= 80 ? "success" : data.collectionRate !== null && data.collectionRate < 60 ? "danger" : "default"}
        />
      </div>

      {/* Monthly trend */}
      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">Revenue trend (6 months)</div>
        <div className="space-y-1.5">
          {data.monthlyTrend.map((t) => (
            <div key={t.label} className="flex items-center gap-3 text-xs">
              <div className="w-16 text-slate-500 shrink-0">{t.label}</div>
              <div className="flex-1 bg-slate-100 rounded h-5 relative overflow-hidden">
                <div
                  className="bg-primary-500 h-full rounded"
                  style={{ width: `${Math.max((t.total / maxTrend) * 100, 2)}%` }}
                />
              </div>
              <div className="w-20 text-right font-medium text-slate-900">
                {fmt(t.total)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top members */}
      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">
          Top 10 members by lifetime value
        </div>
        {data.topMembers.length === 0 ? (
          <p className="text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {data.topMembers.map((m, i) => (
              <div key={m.memberId} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-4 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.phone}</div>
                  </div>
                </div>
                <div className="font-semibold text-slate-900 shrink-0">
                  {fmt(m.lifetimeValue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Revenue by plan */}
      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">Revenue by plan</div>
        {data.revenueByPlan.length === 0 ? (
          <p className="text-sm text-slate-500">No plans with revenue.</p>
        ) : (
          <div className="space-y-2">
            {data.revenueByPlan.map((p) => (
              <div key={p.planName} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-slate-900">{p.planName}</div>
                  <div className="text-xs text-slate-500">{p.memberCount} members</div>
                </div>
                <div className="font-semibold text-slate-900">{fmt(p.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Trainer ROI */}
      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">
          Trainer ROI (last 6 months)
        </div>
        {data.trainerRoi.length === 0 ? (
          <p className="text-sm text-slate-500">No trainers yet.</p>
        ) : (
          <div className="space-y-3">
            {data.trainerRoi.map((t) => (
              <div
                key={t.trainerId}
                className="flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 pb-2 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.packs} packs · revenue {fmt(t.revenue)} · cost {fmt(t.cost)}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold shrink-0 ${
                    t.roi === null
                      ? "text-slate-400"
                      : t.roi >= 150
                      ? "text-emerald-600"
                      : t.roi >= 80
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {t.roi !== null ? `${t.roi}% ROI` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "danger";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
      ? "text-rose-600"
      : "text-slate-900";
  return (
    <Card className="p-4">
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className={`text-xl font-bold mt-1 ${valueClass}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>
    </Card>
  );
}
