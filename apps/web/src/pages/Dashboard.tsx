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
        <div className="text-sm text-slate-500">Welcome back</div>
        <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
        <Link to="/app/payments" className="col-span-2">
          <Tile
            label="Collected this month"
            value={
              data ? `₹${data.monthRevenue.toLocaleString("en-IN")}` : undefined
            }
            accent="text-primary-700"
          />
        </Link>
      </div>

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
                  <div className="text-xs text-slate-500">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {p.method}
                  </div>
                </div>
                <div className="font-semibold text-slate-900">
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