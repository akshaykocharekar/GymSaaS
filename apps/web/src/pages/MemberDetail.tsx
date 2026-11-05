import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import Badge from "../components/ui/Badge.js";
import Button from "../components/ui/Button.js";
import Card from "../components/ui/Card.js";
import Skeleton from "../components/ui/Skeleton.js";
import { useToast } from "../components/Toast.js";
import PaymentSheet from "../components/PaymentSheet.js";
import RenewSheet from "../components/RenewSheet.js";
import WhatsAppSheet from "../components/WhatsAppSheet.js";

interface Member {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  joiningDate: string;
  planId: string;
  membershipStartDate: string;
  expiryDate: string;
  isInactive: boolean;
  advanceBalance: number;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  notes: string | null;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  paymentDate: string;
  note: string | null;
}
interface HistoryRow {
  id: string;
  planName: string;
  durationDays: number;
  startDate: string;
  expiryDate: string;
  amountPaid: number | null;
}

type Tab = "details" | "payments" | "history";

export default function MemberDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { gym } = useGym();
  const [member, setMember] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("details");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    api
      .get<{ member: Member }>(`/api/gym/members/${id}`, true)
      .then((res) => setMember(res.member))
      .catch(() => nav("/app/members", { replace: true }));
  }, [id, nav]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function toggleInactive() {
    if (!member) return;
    setBusy(true);
    try {
      const res = await api.patch<{ member: Member }>(
        `/api/gym/members/${member.id}/inactive`,
        { isInactive: !member.isInactive },
        true
      );
      setMember(res.member);
      toast.show(res.member.isInactive ? "Marked inactive" : "Reactivated");
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(member.expiryDate).getTime() - Date.now()) / 86_400_000
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200/60 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-900">Member</h1>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold text-lg shrink-0">
              {member.fullName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                {member.fullName}
              </h2>
              <div className="text-sm text-slate-600">{member.phone}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge status={member.status} />
                {member.advanceBalance > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    ₹{member.advanceBalance} advance
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setWaOpen(true)}
              className="shrink-0 w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100"
              aria-label="Send WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.8.96h.01a7.94 7.94 0 0 0 5.6-13.55zM12 18.5a6.6 6.6 0 0 1-3.4-.93l-.24-.14-2.5.66.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.4 6.6 6.6 0 0 1-6.6 6.6zm3.62-4.94c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.62.78-.11.13-.23.15-.42.05-.2-.1-.83-.3-1.58-.97-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34l-.38-.01c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.38 2.11 3.34 2.96.47.2.83.32 1.12.41.47.15.9.13 1.24.08.38-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.08-.18-.13-.38-.23z" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setPaymentOpen(true)}
            >
              Record payment
            </Button>
            <Button size="sm" fullWidth onClick={() => setRenewOpen(true)}>
              Renew
            </Button>
          </div>
        </Card>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["details", "payments", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <>
            <Card className="p-5 space-y-3">
              <Row
                label="Plan expiry"
                value={new Date(member.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
              <Row
                label="Days remaining"
                value={
                  daysLeft > 0
                    ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                    : daysLeft === 0
                    ? "Today"
                    : `${Math.abs(daysLeft)} day${
                        Math.abs(daysLeft) === 1 ? "" : "s"
                      } ago`
                }
              />
              {member.advanceBalance > 0 && (
                <Row label="Advance balance" value={`₹${member.advanceBalance}`} />
              )}
              <Row
                label="Joined"
                value={new Date(member.joiningDate).toLocaleDateString("en-IN")}
              />
              {member.email && <Row label="Email" value={member.email} />}
              {member.address && <Row label="Address" value={member.address} />}
              {member.notes && <Row label="Notes" value={member.notes} />}
            </Card>

            <Button
              variant={member.isInactive ? "secondary" : "danger"}
              fullWidth
              size="lg"
              onClick={toggleInactive}
              loading={busy}
            >
              {member.isInactive ? "Reactivate member" : "Mark inactive"}
            </Button>
          </>
        )}

        {tab === "payments" && (
          <PaymentsTab memberId={member.id} key={refreshKey} />
        )}
        {tab === "history" && (
          <HistoryTab memberId={member.id} key={refreshKey} />
        )}
      </div>

      <PaymentSheet
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        memberId={member.id}
        defaultAmount={0}
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
          if (tab !== "payments") setTab("payments");
        }}
      />
      <RenewSheet
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        memberId={member.id}
        currentPlanId={member.planId}
        currentAdvanceBalance={member.advanceBalance}
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
          load();
        }}
      />
      <WhatsAppSheet
        open={waOpen}
        onClose={() => setWaOpen(false)}
        member={{
          fullName: member.fullName,
          phone: member.phone,
          expiryDate: member.expiryDate,
        }}
        gymName={gym?.name || "the gym"}
        defaultKind={member.status === "EXPIRED" ? "RENEWAL_REMINDER" : "EXPIRY_REMINDER"}
      />
    </div>
  );
}

function PaymentsTab({ memberId }: { memberId: string }) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  useEffect(() => {
    api
      .get<{ payments: Payment[] }>(
        `/api/gym/members/${memberId}/payments`,
        true
      )
      .then((res) => setPayments(res.payments));
  }, [memberId]);

  if (!payments) return <Skeleton className="h-24 w-full" />;
  if (payments.length === 0)
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No payments recorded yet.
      </Card>
    );
  return (
    <div className="space-y-2">
      {payments.map((p) => (
        <Card key={p.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-900">₹{p.amount}</div>
            <div className="text-xs text-slate-500">
              {new Date(p.paymentDate).toLocaleDateString("en-IN")} · {p.method}
              {p.note ? ` · ${p.note}` : ""}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function HistoryTab({ memberId }: { memberId: string }) {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  useEffect(() => {
    api
      .get<{ history: HistoryRow[] }>(
        `/api/gym/members/${memberId}/history`,
        true
      )
      .then((res) => setRows(res.history));
  }, [memberId]);

  if (!rows) return <Skeleton className="h-24 w-full" />;
  if (rows.length === 0)
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No renewals yet.
      </Card>
    );
  return (
    <div className="space-y-2">
      {rows.map((h) => (
        <Card key={h.id} className="p-4">
          <div className="text-sm font-medium text-slate-900">{h.planName}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {new Date(h.startDate).toLocaleDateString("en-IN")} →{" "}
            {new Date(h.expiryDate).toLocaleDateString("en-IN")} ·{" "}
            {h.durationDays}d
            {h.amountPaid !== null
              ? ` · ₹${h.amountPaid} collected`
              : " · from advance"}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}