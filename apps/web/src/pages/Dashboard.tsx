import { useEffect, useState } from "react";
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
}

interface DashData {
  counts: { total: number; active: number; expired: number; expiring: number };
  monthRevenue: number;
  recentPayments: RecentPayment[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    api.get<{ ok: boolean } & DashData>("/api/gym/dashboard", true).then((res) => {
      setData({
        counts: res.counts,
        monthRevenue: res.monthRevenue,
        recentPayments: res.recentPayments,
      });
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <div className="text-sm text-stone-500">Welcome back</div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link to="/app/members" className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60">
          <Tile label="Total" value={data?.counts.total} accent="text-white" />
        </Link>
        <Link to="/app/members" className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60">
          <Tile label="Active" value={data?.counts.active} accent="text-emerald-400" dot="bg-emerald-400" />
        </Link>
        <Link to="/app/expiries" className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60">
          <Tile
            label="Expiring 7d"
            value={data?.counts.expiring}
            accent="text-amber-300"
            dot="bg-amber-300"
          />
        </Link>
        <Link to="/app/expiries" className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60">
          <Tile
            label="Expired"
            value={data?.counts.expired}
            accent="text-rose-400"
            dot="bg-rose-400"
          />
        </Link>
        <Link to="/app/payments" className="col-span-2 block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60">
          <Tile
            featured
            label="Collected this month"
            value={
              data ? `₹${data.monthRevenue.toLocaleString("en-IN")}` : undefined
            }
            accent="text-orange-300"
          />
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">
                    {p.memberName}
                  </div>
                  <div className="text-xs text-stone-500">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {p.method}
                  </div>
                </div>
                <div className="shrink-0 font-semibold text-white">
                  ₹{p.amount.toLocaleString("en-IN")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  dot,
  featured,
}: {
  label: string;
  value: number | string | undefined;
  accent: string;
  dot?: string;
  featured?: boolean;
}) {
  const body = (
    <div
      className={`h-full p-4 sm:p-5 transition duration-200 ${
        featured
          ? "rounded-[calc(1rem-1px)] bg-[#120f0d]"
          : "rounded-2xl border border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-orange-400/40 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {label}
      </div>
      {value === undefined ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-white/[0.08]" />
      ) : (
        <div className={`mt-1 text-2xl sm:text-3xl font-semibold tracking-tight ${accent}`}>{value}</div>
      )}
    </div>
  );

  if (!featured) return body;

  return (
    <div
      className="rounded-2xl p-px transition duration-200 hover:-translate-y-0.5"
      style={{
        background:
          "linear-gradient(160deg, rgba(251,146,60,0.9), rgba(251,146,60,0.08) 45%, rgba(252,211,77,0.5))",
      }}
    >
      {body}
    </div>
  );
}