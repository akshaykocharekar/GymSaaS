import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../lib/api.js";
import Card from "../components/ui/Card.js";
import Skeleton from "../components/ui/Skeleton.js";

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <div className="text-sm text-slate-500">Welcome back</div>
        <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
      </div>

      {/* Members */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
          Members
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/app/members">
            <Tile label="Total" value={data?.counts.total} accent="text-slate-900" />
          </Link>
          <Link to="/app/members">
            <Tile label="Active" value={data?.counts.active} accent="text-green-600" />
          </Link>
          <Link to="/app/expiries">
            <Tile
              label="Expiring 7d"
              value={data?.counts.expiring}
              accent="text-amber-600"
            />
          </Link>
          <Link to="/app/expiries">
            <Tile
              label="Expired"
              value={data?.counts.expired}
              accent="text-red-600"
            />
          </Link>
        </div>
      </div>

      {/* Revenue with range selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Revenue
          </div>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  range === r
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.toUpperCase().replace("M", "M").replace("12M", "1Y")}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-2">{RANGE_LABELS[range]}</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/app/payments">
            <Tile
              label="Membership"
              value={
                data
                  ? `₹${data.revenue.membership.toLocaleString("en-IN")}`
                  : undefined
              }
              accent="text-primary-700"
            />
          </Link>
          <Link to="/app/payments">
            <Tile
              label="Session packs"
              value={
                data
                  ? `₹${data.revenue.session.toLocaleString("en-IN")}`
                  : undefined
              }
              accent="text-emerald-600"
            />
          </Link>
          <Link to="/app/payments">
            <Tile
              label="Total collected"
              value={
                data
                  ? `₹${data.revenue.total.toLocaleString("en-IN")}`
                  : undefined
              }
              accent="text-slate-900"
            />
          </Link>
        </div>
      </div>

      {/* Recent payments */}
      <Card className="p-5">
        <div className="flex justify-between items-baseline mb-3">
          <div className="font-semibold text-slate-900">Recent payments</div>
          <Link to="/app/payments" className="text-xs text-primary-600 font-medium">
            View all
          </Link>
        </div>
        {!data ? (
          <Skeleton className="h-20 w-full" />
        ) : data.recentPayments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentPayments.map((p) => (
              <Link
                key={p.id}
                to={`/app/members/${p.memberId}`}
                className="flex items-center justify-between text-sm hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded"
              >
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {p.memberName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {p.method}
                    {p.note && (
                      <span className="text-slate-400"> · {p.note}</span>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-slate-900 shrink-0">
                  ₹{p.amount.toLocaleString("en-IN")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string | undefined;
  accent: string;
}) {
  return (
    <Card interactive className="p-4">
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      {value === undefined ? (
        <Skeleton className="h-8 w-16 mt-2" />
      ) : (
        <div className={`text-2xl font-bold mt-1 ${accent}`}>{value}</div>
      )}
    </Card>
  );
}
