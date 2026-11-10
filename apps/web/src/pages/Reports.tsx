import { ReactNode, useEffect, useState } from "react";
import { api } from "../lib/api.js";

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

const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// short labels for chart columns so they fit on a phone
function compactInr(v: number) {
  if (v >= 10000000) return `₹${+(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${+(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${+(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-400">
      <span className="h-px w-4 bg-orange-400/60" />
      {children}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      {children}
    </section>
  );
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
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

  const distTotal = distribution?.reduce((s, d) => s + d.count, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Reports</h1>
        <p className="text-sm text-stone-500 mt-1">Last 6 months</p>
      </div>

      {/* Net summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
            Total revenue
          </div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {inr(totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-stone-500">membership + session packs</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Trainer payouts
          </div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-rose-400">
            {inr(totalPayouts)}
          </div>
          <div className="mt-1 text-xs text-stone-500">salary + commission</div>
        </div>

        <div
          className="rounded-2xl p-px"
          style={{
            background:
              "linear-gradient(160deg, rgba(251,146,60,0.9), rgba(251,146,60,0.08) 45%, rgba(252,211,77,0.5))",
          }}
        >
          <div className="h-full rounded-[calc(1rem-1px)] bg-[#120f0d] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${net >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              Net (before other costs)
            </div>
            <div
              className={`mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight ${
                net >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {inr(net)}
            </div>
            <div className="mt-1 text-xs text-stone-500">revenue − trainer payouts</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Eyebrow>Money</Eyebrow>
        <ReportCard
          title="Membership revenue"
          data={revenue}
          valueKey="total"
          format={inr}
          compact={compactInr}
          tone="orange"
        />
        <ReportCard
          title="Session pack revenue"
          data={sessionRev}
          valueKey="total"
          format={inr}
          compact={compactInr}
          tone="emerald"
        />
        <ReportCard
          title="Trainer payouts"
          data={payouts}
          valueKey="total"
          format={inr}
          compact={compactInr}
          tone="rose"
        />
      </div>

      <div className="space-y-3">
        <Eyebrow>Members</Eyebrow>
        <ReportCard title="New registrations" data={newRegs} valueKey="count" tone="amber" />
        <ReportCard title="Renewals" data={renewals} valueKey="count" tone="orange" />
      </div>

      <div className="space-y-3">
        <Eyebrow>Plans &amp; dues</Eyebrow>

        <Panel>
          <div className="font-semibold text-white mb-4">Membership distribution</div>
          {!distribution ? (
            <Pulse className="h-20 w-full" />
          ) : distribution.length === 0 ? (
            <p className="text-sm text-stone-500">No plans yet.</p>
          ) : (
            <div className="space-y-4">
              {distribution.map((d) => {
                const share = distTotal ? (d.count / distTotal) * 100 : 0;
                return (
                  <div key={d.planName}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-stone-200">
                        {d.planName}{" "}
                        <span className="text-stone-500">₹{d.price}</span>
                      </span>
                      <span className="shrink-0 font-medium text-white">
                        {d.count} members
                        <span className="ml-1.5 text-xs font-normal text-stone-500">
                          {Math.round(share)}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300"
                        style={{ width: `${Math.max(share, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-semibold text-white">Outstanding dues</div>
            {dues && (
              <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-medium text-rose-300 ring-1 ring-rose-400/20">
                {dues.count} expired
              </span>
            )}
          </div>
          {!dues ? (
            <Pulse className="h-20 w-full" />
          ) : dues.members.length === 0 ? (
            <p className="text-sm text-stone-500">All paid up 🎉</p>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto -mx-1 px-1">
              {dues.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-stone-300 ring-1 ring-white/10">
                      {m.fullName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="truncate text-stone-200">{m.fullName}</span>
                  </div>
                  <span className="shrink-0 text-xs text-rose-300">
                    expired {new Date(m.expiryDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

type Tone = "orange" | "emerald" | "rose" | "amber";

const TONES: Record<Tone, { bar: string; peak: string; text: string; glow: string }> = {
  orange: {
    bar: "from-orange-500/40 to-orange-400/60",
    peak: "from-orange-500 to-amber-300",
    text: "text-orange-300",
    glow: "shadow-orange-500/30",
  },
  emerald: {
    bar: "from-emerald-600/40 to-emerald-400/60",
    peak: "from-emerald-500 to-emerald-300",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/30",
  },
  rose: {
    bar: "from-rose-600/40 to-rose-400/60",
    peak: "from-rose-500 to-rose-300",
    text: "text-rose-300",
    glow: "shadow-rose-500/30",
  },
  amber: {
    bar: "from-amber-500/40 to-amber-300/60",
    peak: "from-amber-400 to-yellow-200",
    text: "text-amber-300",
    glow: "shadow-amber-400/30",
  },
};

function ReportCard({
  title,
  data,
  valueKey,
  format,
  compact,
  tone = "orange",
}: {
  title: string;
  data: MonthRow[] | null;
  valueKey: "total" | "count";
  format?: (v: number) => string;
  compact?: (v: number) => string;
  tone?: Tone;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (!data) return undefined;
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [data]);

  if (!data) {
    return (
      <Panel>
        <div className="font-semibold text-white mb-3">{title}</div>
        <Pulse className="h-40 w-full" />
      </Panel>
    );
  }

  const t = TONES[tone];
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const grand = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  const peakIdx = data.reduce(
    (best, d, i) => ((d[valueKey] || 0) > (data[best][valueKey] || 0) ? i : best),
    0
  );
  const hasPeak = grand > 0;

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="font-semibold text-white">{title}</div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Total</div>
          <div className={`text-sm font-semibold ${t.text}`}>
            {format ? format(grand) : grand}
          </div>
        </div>
      </div>

      <div
        className="flex h-44 items-end gap-1.5 sm:gap-3"
        role="img"
        aria-label={`${title} by month`}
      >
        {data.map((d, i) => {
          const v = d[valueKey] || 0;
          const pct = Math.max((v / max) * 100, 3);
          const isPeak = hasPeak && i === peakIdx;
          return (
            <div
              key={d.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div className="flex w-full flex-1 items-end pt-5">
                <div
                  className={`relative w-full rounded-t-lg bg-gradient-to-t transition-[height] duration-700 ease-out motion-reduce:transition-none ${
                    isPeak ? `${t.peak} shadow-lg ${t.glow}` : t.bar
                  }`}
                  style={{
                    height: grown ? `${pct}%` : "3%",
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  <span
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-xs font-medium tabular-nums ${
                      isPeak ? t.text : v === 0 ? "text-stone-600" : "text-stone-400"
                    }`}
                  >
                    {compact ? compact(v) : v}
                  </span>
                </div>
              </div>
              <div className="w-full truncate text-center text-[10px] sm:text-xs text-stone-500">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}