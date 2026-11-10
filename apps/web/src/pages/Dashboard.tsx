import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../lib/api.js";

interface RecentPayment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: string;
  paymentDate: string;
  note: string | null;
}

type Range = "1m" | "3m" | "6m" | "12m";

const RANGE_LABELS: Record<Range, string> = {
  "1m": "This month",
  "3m": "Last 3 months",
  "6m": "Last 6 months",
  "12m": "Last year",
};

interface DashData {
  counts: { total: number; active: number; expired: number; expiring: number };
  revenue: { membership: number; session: number; total: number };
  recentPayments: RecentPayment[];
}

const linkClass =
  "block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-400">
      <span className="h-px w-4 bg-orange-400/60" />
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("1m");
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    setData(null);
    api
      .get<{ ok: boolean } & DashData>(`/api/gym/dashboard?range=${range}`, true)
      .then((res) => {
        setData({
          counts: res.counts,
          revenue: res.revenue,
          recentPayments: res.recentPayments,
        });
      });
  }, [range]);

  // Desktop-only: revenue split
  const revTotal = data ? data.revenue.membership + data.revenue.session : 0;
  const membershipPct = data && revTotal > 0 ? (data.revenue.membership / revTotal) * 100 : 0;
  const sessionPct = revTotal > 0 ? 100 - membershipPct : 0;

  const revenueFooter = !data ? null : revTotal > 0 ? (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-300"
          style={{ width: `${membershipPct}%` }}
        />
        <div className="h-full flex-1 bg-amber-200/50" />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          Membership
          <span className="font-medium text-stone-200">{Math.round(membershipPct)}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-200/70" />
          Session packs
          <span className="font-medium text-stone-200">{Math.round(sessionPct)}%</span>
        </span>
      </div>
    </div>
  ) : (
    <p className="text-sm text-stone-500">
      No payments recorded {range === "1m" ? "this month" : "in this period"}. Try a longer range.
    </p>
  );

  // Desktop-only: members health bar
  const total = data?.counts.total ?? 0;
  const activePct = data && total > 0 ? (data.counts.active / total) * 100 : 0;
  const expiredPct = data && total > 0 ? (data.counts.expired / total) * 100 : 0;

  return (
    <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8 lg:space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-stone-500">Welcome back</div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            {user?.name}
          </h1>
        </div>
        <div className="hidden sm:block pb-1 text-sm text-stone-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* Main column */}
        <div className="flex flex-col gap-8 lg:gap-12 lg:col-span-8 min-w-0">
          {/* Members */}
          <div>
            <div className="mb-3">
              <SectionLabel>Members</SectionLabel>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link to="/app/members" className={linkClass}>
                <Tile roomy label="Total" value={data?.counts.total} accent="text-white" />
              </Link>
              <Link to="/app/members" className={linkClass}>
                <Tile roomy label="Active" value={data?.counts.active} accent="text-emerald-400" dot="bg-emerald-400" />
              </Link>
              <Link to="/app/expiries" className={linkClass}>
                <Tile
                  roomy
                  label="Expiring 7d"
                  value={data?.counts.expiring}
                  accent="text-amber-300"
                  dot="bg-amber-300"
                />
              </Link>
              <Link to="/app/expiries" className={linkClass}>
                <Tile
                  roomy
                  label="Expired"
                  value={data?.counts.expired}
                  accent="text-rose-400"
                  dot="bg-rose-400"
                />
              </Link>
            </div>

            {data && total > 0 && (
              <div className="hidden lg:block mt-5">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full bg-emerald-400/80"
                    style={{ width: `${activePct}%` }}
                  />
                  <div
                    className="h-full bg-rose-400/80"
                    style={{ width: `${expiredPct}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-5 text-xs text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {Math.round(activePct)}% active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    {Math.round(expiredPct)}% expired
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Revenue with range selector (first on desktop) */}
          <div className="lg:order-first">
            <div className="flex items-center justify-between gap-3 mb-3">
              <SectionLabel>Revenue</SectionLabel>
              <div className="flex gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5">
                {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      range === r
                        ? "bg-orange-400 text-orange-950 shadow-sm shadow-orange-500/30"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {r.toUpperCase().replace("M", "M").replace("12M", "1Y")}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-stone-500 mb-3">{RANGE_LABELS[range]}</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              <Link to="/app/payments" className={`${linkClass} lg:order-first lg:col-span-2`}>
                <Tile
                  featured
                  large
                  label="Total collected"
                  value={
                    data
                      ? `₹${data.revenue.total.toLocaleString("en-IN")}`
                      : undefined
                  }
                  accent="text-white"
                  footer={revenueFooter}
                />
              </Link>
              <Link to="/app/payments" className={linkClass}>
                <Tile
                  roomy
                  label="Membership"
                  value={
                    data
                      ? `₹${data.revenue.membership.toLocaleString("en-IN")}`
                      : undefined
                  }
                  accent="text-orange-300"
                />
              </Link>
              <Link to="/app/payments" className={linkClass}>
                <Tile
                  roomy
                  label="Session packs"
                  value={
                    data
                      ? `₹${data.revenue.session.toLocaleString("en-IN")}`
                      : undefined
                  }
                  accent="text-emerald-400"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Side column: sticky on desktop */}
        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-6 min-w-0">
          {/* Needs attention (desktop only) */}
          <section className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="font-semibold text-white mb-3">Needs attention</div>
            {!data ? (
              <div className="h-16 w-full animate-pulse rounded-xl bg-white/[0.06]" />
            ) : data.counts.expiring === 0 && data.counts.expired === 0 ? (
              <p className="text-sm text-stone-500">Everyone is up to date.</p>
            ) : (
              <div className="space-y-1">
                {data.counts.expiring > 0 && (
                  <Link
                    to="/app/expiries"
                    className="flex items-center justify-between gap-3 -mx-2 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-2.5 text-stone-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                      {data.counts.expiring} expiring in 7 days
                    </span>
                    <span className="text-xs font-medium text-orange-300">Review</span>
                  </Link>
                )}
                {data.counts.expired > 0 && (
                  <Link
                    to="/app/expiries"
                    className="flex items-center justify-between gap-3 -mx-2 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-2.5 text-stone-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      {data.counts.expired} expired
                    </span>
                    <span className="text-xs font-medium text-orange-300">Follow up</span>
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Recent payments */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:p-6">
            <div className="flex justify-between items-baseline mb-3">
              <div className="font-semibold text-white">Recent payments</div>
              <Link to="/app/payments" className="text-xs font-medium text-orange-300 hover:text-orange-200 transition-colors">
                View all
              </Link>
            </div>
            {!data ? (
              <div className="h-20 w-full animate-pulse rounded-xl bg-white/[0.06]" />
            ) : data.recentPayments.length === 0 ? (
              <p className="text-sm text-stone-500">No payments yet.</p>
            ) : (
              <div className="space-y-1">
                {data.recentPayments.map((p) => (
                  <Link
                    key={p.id}
                    to={`/app/members/${p.memberId}`}
                    className="flex items-center justify-between gap-3 text-sm hover:bg-white/[0.05] -mx-2 px-2 py-2.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="hidden lg:grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-stone-300 ring-1 ring-white/10">
                        {p.memberName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">
                          {p.memberName}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {p.method}
                          {p.note && (
                            <span className="text-stone-600"> · {p.note}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-white shrink-0">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  dot,
  featured,
  large,
  roomy,
  footer,
}: {
  label: string;
  value: number | string | undefined;
  accent: string;
  dot?: string;
  featured?: boolean;
  large?: boolean;
  roomy?: boolean;
  footer?: ReactNode;
}) {
  const pad = large ? "lg:p-8" : roomy ? "lg:p-6" : "";
  const size = large
    ? "text-2xl sm:text-3xl lg:mt-3 lg:text-6xl"
    : roomy
    ? "text-2xl sm:text-3xl lg:mt-2 lg:text-4xl"
    : "text-2xl sm:text-3xl";

  const body = (
    <div
      className={`h-full p-4 sm:p-5 transition duration-200 ${pad} ${
        featured
          ? "rounded-[calc(1rem-1px)] bg-[#120f0d]"
          : "rounded-2xl border border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-orange-400/40 hover:bg-white/[0.05] motion-reduce:hover:translate-y-0"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {label}
      </div>
      {value === undefined ? (
        <div
          className={`mt-2 h-8 w-16 animate-pulse rounded-lg bg-white/[0.08] ${
            large ? "lg:h-14 lg:w-56" : roomy ? "lg:h-10" : ""
          }`}
        />
      ) : (
        <div className={`mt-1 font-semibold tracking-tight ${size} ${accent}`}>{value}</div>
      )}
      {footer && <div className="hidden lg:block mt-8">{footer}</div>}
    </div>
  );

  if (!featured) return body;

  return (
    <div
      className="h-full rounded-2xl p-px transition duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      style={{
        background:
          "linear-gradient(160deg, rgba(251,146,60,0.9), rgba(251,146,60,0.08) 45%, rgba(252,211,77,0.5))",
      }}
    >
      {body}
    </div>
  );
}