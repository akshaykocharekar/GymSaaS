import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Card from "../components/ui/Card.js";
import Skeleton from "../components/ui/Skeleton.js";

interface MonthRow {
  label: string;
  total?: number;
  count?: number;
}

interface DuesMember {
  id: string;
  fullName: string;
  phone: string;
  expiryDate: string;
}

export default function Reports() {
  const [revenue, setRevenue] = useState<MonthRow[] | null>(null);
  const [sessionRev, setSessionRev] = useState<MonthRow[] | null>(null);
  const [payouts, setPayouts] = useState<MonthRow[] | null>(null);
  const [newRegs, setNewRegs] = useState<MonthRow[] | null>(null);
  const [renewals, setRenewals] = useState<MonthRow[] | null>(null);
  const [distribution, setDistribution] = useState<
    { planName: string; count: number; price: number }[] | null
  >(null);
  const [dues, setDues] = useState<{ count: number; members: DuesMember[] } | null>(
    null
  );

  useEffect(() => {
    Promise.all([
      api.get<{ months: MonthRow[] }>("/api/gym/reports/revenue", true),
      api.get<{ months: MonthRow[] }>("/api/gym/reports/session-revenue", true),
      api.get<{ months: MonthRow[] }>("/api/gym/reports/trainer-payouts", true),
      api.get<{ months: MonthRow[] }>("/api/gym/reports/new-registrations", true),
      api.get<{ months: MonthRow[] }>("/api/gym/reports/renewals", true),
      api.get<{ distribution: any[] }>("/api/gym/reports/distribution", true),
      api.get<{ count: number; members: DuesMember[] }>("/api/gym/reports/dues", true),
    ]).then(([r, sr, p, nr, rn, d, du]) => {
      setRevenue(r.months);
      setSessionRev(sr.months);
      setPayouts(p.months);
      setNewRegs(nr.months);
      setRenewals(rn.months);
      setDistribution(d.distribution);
      setDues(du);
    });
  }, []);

  const totalRevenue =
    (revenue?.reduce((s, r) => s + (r.total || 0), 0) || 0) +
    (sessionRev?.reduce((s, r) => s + (r.total || 0), 0) || 0);
  const totalPayouts = payouts?.reduce((s, p) => s + (p.total || 0), 0) || 0;
  const net = totalRevenue - totalPayouts;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
      </div>

      {/* Net summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Total revenue
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            membership + session packs
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Trainer payouts
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            ₹{totalPayouts.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">salary + commission</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Net (before other costs)
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              net >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            ₹{net.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            revenue − trainer payouts
          </div>
        </Card>
      </div>

      <ReportCard
        title="Membership revenue"
        data={revenue}
        valueKey="total"
        format={(v) => `₹${v.toLocaleString("en-IN")}`}
      />
      <ReportCard
        title="Session pack revenue"
        data={sessionRev}
        valueKey="total"
        format={(v) => `₹${v.toLocaleString("en-IN")}`}
      />
      <ReportCard
        title="Trainer payouts"
        data={payouts}
        valueKey="total"
        format={(v) => `₹${v.toLocaleString("en-IN")}`}
      />
      <ReportCard title="New registrations" data={newRegs} valueKey="count" />
      <ReportCard title="Renewals" data={renewals} valueKey="count" />

      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">Membership distribution</div>
        {!distribution ? (
          <Skeleton className="h-20 w-full" />
        ) : distribution.length === 0 ? (
          <p className="text-sm text-slate-500">No plans yet.</p>
        ) : (
          <div className="space-y-2">
            {distribution.map((d) => (
              <div key={d.planName} className="flex justify-between text-sm">
                <span className="text-slate-700">
                  {d.planName}{" "}
                  <span className="text-slate-400">₹{d.price}</span>
                </span>
                <span className="font-medium text-slate-900">{d.count} members</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">
          Outstanding dues
          {dues && (
            <span className="ml-2 text-sm font-normal text-red-600">
              {dues.count} expired
            </span>
          )}
        </div>
        {!dues ? (
          <Skeleton className="h-20 w-full" />
        ) : dues.members.length === 0 ? (
          <p className="text-sm text-slate-500">All paid up 🎉</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dues.members.map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="text-slate-700">{m.fullName}</span>
                <span className="text-red-600 text-xs">
                  expired {new Date(m.expiryDate).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ReportCard({
  title,
  data,
  valueKey,
  format,
}: {
  title: string;
  data: MonthRow[] | null;
  valueKey: "total" | "count";
  format?: (v: number) => string;
}) {
  if (!data) {
    return (
      <Card className="p-5">
        <div className="font-semibold text-slate-900 mb-3">{title}</div>
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const grand = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">
          Total: {format ? format(grand) : grand}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.map((d) => {
          const v = d[valueKey] || 0;
          const pct = (v / max) * 100;
          return (
            <div key={d.label} className="flex items-center gap-3 text-xs">
              <div className="w-16 text-slate-500 shrink-0">{d.label}</div>
              <div className="flex-1 bg-slate-100 rounded h-5 relative overflow-hidden">
                <div
                  className="bg-primary-500 h-full rounded"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <div className="w-20 text-right font-medium text-slate-900 shrink-0">
                {format ? format(v) : v}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}