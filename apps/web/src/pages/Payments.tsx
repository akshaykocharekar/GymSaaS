import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Card from "../components/ui/Card.js";
import EmptyState from "../components/ui/EmptyState.js";
import Skeleton from "../components/ui/Skeleton.js";
import FAB from "../components/FAB.js";

interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: "CASH" | "UPI" | "OTHER";
  paymentDate: string;
  createdAt: string;
  note: string | null;
}

interface Stats {
  thisMonth: number;
  allTime: number;
}

const methodStyles: Record<string, string> = {
  CASH: "bg-green-50 text-green-700",
  UPI: "bg-blue-50 text-blue-700",
  OTHER: "bg-slate-100 text-slate-700",
};

function formatDateTime(paymentDate: string, createdAt?: string) {
  const datePart = new Date(paymentDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  if (!createdAt) return datePart;
  const timePart = new Date(createdAt).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

export default function Payments() {
  const { hasPermission } = useAuth();
  const canRecord = hasPermission("RECORD_PAYMENTS");
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [method, setMethod] = useState<"all" | "CASH" | "UPI" | "OTHER">("all");

  useEffect(() => {
    let cancelled = false;
    setPayments(null);
    const params = new URLSearchParams();
    if (method !== "all") params.set("method", method);
    api
      .get<{ payments: Payment[] }>(`/api/gym/payments?${params}`, true)
      .then((res) => !cancelled && setPayments(res.payments));
    return () => {
      cancelled = true;
    };
  }, [method]);

  useEffect(() => {
    api
      .get<{ ok: boolean } & Stats>("/api/gym/payments/stats", true)
      .then((res) => setStats({ thisMonth: res.thisMonth, allTime: res.allTime }));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-4 sm:px-6 pt-4 pb-3 space-y-3 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual entries · cash / UPI · newest first
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-[11px] text-slate-500 font-medium">This month</div>
            {stats ? (
              <div className="text-xl font-bold text-green-600">
                ₹{stats.thisMonth.toLocaleString("en-IN")}
              </div>
            ) : (
              <Skeleton className="h-6 w-20 mt-1" />
            )}
          </Card>
          <Card className="p-3">
            <div className="text-[11px] text-slate-500 font-medium">All time</div>
            {stats ? (
              <div className="text-xl font-bold text-slate-900">
                ₹{stats.allTime.toLocaleString("en-IN")}
              </div>
            ) : (
              <Skeleton className="h-6 w-20 mt-1" />
            )}
          </Card>
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
          {(["all", "CASH", "UPI", "OTHER"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                method === m
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {m === "all" ? "All" : m}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-2">
        {payments === null ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            description={
              canRecord
                ? "Tap + to record your first payment."
                : "Payments recorded by the gym owner will show up here."
            }
          />
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-3">
              <div
                className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  methodStyles[p.method]
                }`}
              >
                {p.method}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {p.memberName}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {formatDateTime(p.paymentDate, p.createdAt)}
                  {p.note ? ` · ${p.note}` : ""}
                </div>
              </div>
              <div className="font-semibold text-slate-900 shrink-0">
                ₹{p.amount.toLocaleString("en-IN")}
              </div>
            </Card>
          ))
        )}
      </div>

      {canRecord && <FAB to="/app/payments/new" label="Record payment" />}
    </div>
  );
}
