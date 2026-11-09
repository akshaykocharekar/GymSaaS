import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import Skeleton from "../components/ui/Skeleton.js";
import PayTrainerSheet from "../components/PayTrainerSheet.js";
import {
  COMPENSATION_TYPE_META,
  SESSION_PACK_TYPE_META,
} from "@gymora/shared";

interface TrainerDetailResponse {
  trainer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    joiningDate: string;
    compensationType: string;
    commissionPercent: number;
    monthlySalary: number;
    isActive: boolean;
    notes: string | null;
  };
  earnings: {
    totalSales: number;
    monthSales: number;
    commission: number;
    monthCommission: number;
    monthlySalary: number;
    expectedMonthPayout: number;
  };
  recentPacks: {
    id: string;
    memberId: string;
    type: string;
    sessionsPurchased: number;
    sessionsUsed: number;
    pricePaid: number;
    purchasedAt: string;
  }[];
}

interface PayoutRow {
  id: string;
  amount: number;
  period: string;
  salaryComponent: number;
  commissionComponent: number;
  paidOn: string;
  paymentMethod: string;
  notes: string | null;
}

export default function TrainerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_TRAINERS");

  const [data, setData] = useState<TrainerDetailResponse | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    api
      .get<TrainerDetailResponse & { ok: boolean }>(
        `/api/gym/trainers/${id}`,
        true
      )
      .then(setData)
      .catch(() => nav("/app/trainers", { replace: true }));
  }, [id, nav]);

  const loadPayouts = useCallback(() => {
    api
      .get<{ payouts: PayoutRow[] }>(
        `/api/gym/payouts/trainer/${id}`,
        true
      )
      .then((res) => setPayouts(res.payouts))
      .catch(() => setPayouts([]));
  }, [id]);

  useEffect(() => {
    load();
    loadPayouts();
  }, [load, loadPayouts, refreshKey]);

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { trainer, earnings, recentPacks } = data;
  const meta =
    COMPENSATION_TYPE_META[
      trainer.compensationType as keyof typeof COMPENSATION_TYPE_META
    ] || COMPENSATION_TYPE_META.COMMISSION_ONLY;

  // Sum of payouts this month for the current period
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const paidThisPeriod = (payouts || [])
    .filter((p) => p.period === currentPeriod)
    .reduce((s, p) => s + p.amount, 0);
  const remainingToPay = earnings.expectedMonthPayout - paidThisPeriod;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200/60 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900">{trainer.name}</h1>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-4">
        <Card className="p-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            Contact
          </div>
          <Row label="Phone" value={trainer.phone} />
          {trainer.email && <Row label="Email" value={trainer.email} />}
          <Row
            label="Joined"
            value={new Date(trainer.joiningDate).toLocaleDateString("en-IN")}
          />
        </Card>

        <Card className="p-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            Compensation
          </div>
          <Row label="Type" value={meta.label} />
          {earnings.commission > 0 && (
            <Row label="Commission rate" value={`${trainer.commissionPercent}%`} />
          )}
          {earnings.monthlySalary > 0 && (
            <Row
              label="Monthly salary"
              value={`₹${earnings.monthlySalary.toLocaleString("en-IN")}`}
            />
          )}
        </Card>

        <Card className="p-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            This month ({currentPeriod})
          </div>
          <Row
            label="Pack sales"
            value={`₹${earnings.monthSales.toLocaleString("en-IN")}`}
          />
          {earnings.monthlySalary > 0 && (
            <Row
              label="Salary"
              value={`₹${earnings.monthlySalary.toLocaleString("en-IN")}`}
            />
          )}
          {earnings.monthCommission > 0 && (
            <Row
              label="Commission"
              value={`₹${earnings.monthCommission.toLocaleString("en-IN")}`}
            />
          )}
          <div className="border-t border-slate-100 mt-2 pt-2">
            <Row
              label="Expected payout"
              value={`₹${earnings.expectedMonthPayout.toLocaleString("en-IN")}`}
              bold
            />
            <Row
              label="Already paid"
              value={`₹${paidThisPeriod.toLocaleString("en-IN")}`}
              muted
            />
            <Row
              label="Remaining"
              value={`₹${Math.max(0, remainingToPay).toLocaleString("en-IN")}`}
              bold
              tone={remainingToPay > 0 ? "warning" : "success"}
            />
          </div>

          {canManage && remainingToPay > 0 && (
            <div className="mt-4">
              <Button fullWidth size="md" onClick={() => setSheetOpen(true)}>
                Pay trainer — ₹{Math.max(0, remainingToPay).toLocaleString("en-IN")}
              </Button>
            </div>
          )}
        </Card>

        {recentPacks.length > 0 && (
          <Card className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
              Recent pack sales
            </div>
            <div className="space-y-2">
              {recentPacks.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {SESSION_PACK_TYPE_META[
                        p.type as keyof typeof SESSION_PACK_TYPE_META
                      ]?.label || p.type}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.sessionsUsed}/{p.sessionsPurchased} sessions used ·{" "}
                      {new Date(p.purchasedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">
                      ₹{p.pricePaid.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {payouts && payouts.length > 0 && (
          <Card className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
              Payout history
            </div>
            <div className="space-y-2">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {p.period} · ₹{p.amount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-slate-500">
                      salary ₹{p.salaryComponent} + commission ₹
                      {p.commissionComponent} · {p.paymentMethod} ·{" "}
                      {new Date(p.paidOn).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {canManage && (
        <PayTrainerSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          trainerId={trainer.id}
          monthlySalary={earnings.monthlySalary}
          monthCommission={earnings.monthCommission}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  tone?: "warning" | "success";
}) {
  const valueClass = tone === "warning"
    ? "text-amber-600 font-semibold"
    : tone === "success"
    ? "text-emerald-600 font-semibold"
    : bold
    ? "text-slate-900 font-semibold"
    : muted
    ? "text-slate-500"
    : "text-slate-900 font-medium";
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-slate-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}