import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import Badge from "../components/ui/Badge.js";
import Button from "../components/ui/Button.js";
import Skeleton from "../components/ui/Skeleton.js";
import { useToast } from "../components/Toast.js";
import PaymentSheet from "../components/PaymentSheet.js";
import RenewSheet from "../components/RenewSheet.js";
import WhatsAppSheet from "../components/WhatsAppSheet.js";
import AddSessionPackSheet from "../components/AddSessionPackSheet.js";

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
  trainerId: string | null;
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

interface SessionPack {
  id: string;
  trainerId: string | null;
  type: string;
  typeLabel: string;
  sessionsPurchased: number;
  sessionsUsed: number;
  remaining: number;
  pricePaid: number;
  purchasedAt: string;
  expiresAt: string | null;
}

type Tab = "details" | "payments" | "history";

const panel = "rounded-2xl border border-white/10 bg-white/[0.03]";

export default function MemberDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { gym } = useGym();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_MEMBERS");
  const canRecord = hasPermission("RECORD_PAYMENTS");
  const canSeeTrainers =
    hasPermission("VIEW_TRAINERS") || hasPermission("MANAGE_TRAINERS");

  const [member, setMember] = useState<Member | null>(null);
  const [packs, setPacks] = useState<SessionPack[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("details");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    api
      .get<{ member: Member }>(`/api/gym/members/${id}`, true)
      .then((res) => setMember(res.member))
      .catch(() => nav("/app/members", { replace: true }));
  }, [id, nav]);

  const loadPacks = useCallback(() => {
    if (!canSeeTrainers) return;
    setPacks(null);
    api
      .get<{ packs: SessionPack[] }>(
        `/api/gym/trainers/session-packs/member/${id}`,
        true
      )
      .then((res) => setPacks(res.packs))
      .catch(() => setPacks([]));
  }, [id, canSeeTrainers]);

  useEffect(() => {
    load();
    loadPacks();
  }, [load, loadPacks, refreshKey]);

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

  async function logSessions(packId: string, max: number) {
    if (max < 1) return;
    const input = prompt(`How many sessions used? (1-${max})`, "1");
    if (!input) return;
    const count = parseInt(input, 10);
    if (!count || count < 1 || count > max) {
      toast.show(`Enter a number between 1 and ${max}`, "error");
      return;
    }
    try {
      const res = await api.post<{ remaining: number }>(
        `/api/gym/trainers/session-packs/${packId}/log`,
        { count },
        true
      );
      toast.show(`Logged ${count} sessions · ${res.remaining} left`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    }
  }

  if (!member) {
    return (
      <div className="max-w-2xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-3">
        <Skeleton className="h-8 w-32" />
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-3 lg:space-y-0">
          <Skeleton className="h-40 w-full lg:col-span-4" />
          <Skeleton className="h-64 w-full lg:col-span-8" />
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(member.expiryDate).getTime() - Date.now()) / 86_400_000
  );
  const daysClass =
    daysLeft < 0 ? "text-rose-300" : daysLeft <= 7 ? "text-amber-300" : "text-white";

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto pb-20 lg:pb-10">
      <div className="sticky top-0 z-20 backdrop-blur bg-[#0c0a09]/80 px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-white/5 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="w-10 h-10 rounded-full text-stone-300 transition-colors hover:bg-white/[0.06] hover:text-white flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-white">Member</h1>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* Profile: sticky side column on desktop */}
        <section className={`${panel} p-4 sm:p-5 lg:col-span-4 lg:sticky lg:top-24`}>
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 text-lg font-semibold text-orange-950">
              {member.fullName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-white break-words">
                {member.fullName}
              </h2>
              <div className="text-sm text-stone-400">{member.phone}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge status={member.status} />
                {member.advanceBalance > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-400/25">
                    ₹{member.advanceBalance} advance
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setWaOpen(true)}
              className="shrink-0 w-10 h-10 rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25 flex items-center justify-center transition-colors hover:bg-emerald-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
              aria-label="Send WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.8.96h.01a7.94 7.94 0 0 0 5.6-13.55zM12 18.5a6.6 6.6 0 0 1-3.4-.93l-.24-.14-2.5.66.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.4 6.6 6.6 0 0 1-6.6 6.6zm3.62-4.94c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.62.78-.11.13-.23.15-.42.05-.2-.1-.83-.3-1.58-.97-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34l-.38-.01c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.38 2.11 3.34 2.96.47.2.83.32 1.12.41.47.15.9.13 1.24.08.38-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.08-.18-.13-.38-.23z" />
              </svg>
            </button>
          </div>

          {(canManage || canRecord) && (
            <div className="flex gap-2 mt-4">
              {canRecord && (
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => setPaymentOpen(true)}
                >
                  Record payment
                </Button>
              )}
              {canManage && (
                <Button size="sm" fullWidth onClick={() => setRenewOpen(true)}>
                  Renew
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Tabs + content */}
        <div className="space-y-4 lg:col-span-8 min-w-0">
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            {(["details", "payments", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`flex-1 rounded-lg py-2 text-sm capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${
                  tab === t
                    ? "bg-orange-400 font-semibold text-orange-950 shadow-sm shadow-orange-500/30"
                    : "font-medium text-stone-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <>
              <section className={`${panel} divide-y divide-white/5 px-4 sm:px-5`}>
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
                  valueClass={daysClass}
                  value={
                    daysLeft > 0
                      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                      : daysLeft === 0
                      ? "Today"
                      : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago`
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
              </section>

              {/* Session packs */}
              {canSeeTrainers && (
                <section className={`${panel} p-4 sm:p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      Session packs
                    </div>
                    {canManage && (
                      <button
                        onClick={() => setPackOpen(true)}
                        className="text-xs font-medium text-orange-300 transition-colors hover:text-orange-200"
                      >
                        + Add pack
                      </button>
                    )}
                  </div>
                  {packs === null ? (
                    <Skeleton className="h-12 w-full" />
                  ) : packs.length === 0 ? (
                    <p className="text-sm text-stone-500">No session packs yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {packs.map((p) => {
                        const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
                        return (
                          <div
                            key={p.id}
                            className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                              isExpired
                                ? "border-white/5 bg-white/[0.02] opacity-60"
                                : "border-white/10 bg-white/[0.03]"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-stone-200">
                                {p.typeLabel}
                                {isExpired && (
                                  <span className="ml-1.5 text-[10px] font-medium uppercase text-rose-300">
                                    expired
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-stone-500">
                                {p.sessionsUsed}/{p.sessionsPurchased} used ·{" "}
                                <span
                                  className={
                                    p.remaining > 0
                                      ? "font-medium text-emerald-300"
                                      : "text-stone-600"
                                  }
                                >
                                  {p.remaining} remaining
                                </span>
                              </div>
                            </div>
                            {canManage && p.remaining > 0 && !isExpired && (
                              <button
                                onClick={() => logSessions(p.id, p.remaining)}
                                className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-200 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"
                              >
                                Log used
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {canManage && (
                <Button
                  variant={member.isInactive ? "secondary" : "danger"}
                  fullWidth
                  size="lg"
                  onClick={toggleInactive}
                  loading={busy}
                >
                  {member.isInactive ? "Reactivate member" : "Mark inactive"}
                </Button>
              )}
            </>
          )}

          {tab === "payments" && (
            <PaymentsTab memberId={member.id} key={refreshKey} />
          )}
          {tab === "history" && (
            <HistoryTab memberId={member.id} key={refreshKey} />
          )}
        </div>
      </div>

      {canRecord && (
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
      )}
      {canManage && (
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
      )}
      {canManage && canSeeTrainers && (
        <AddSessionPackSheet
          open={packOpen}
          onClose={() => setPackOpen(false)}
          memberId={member.id}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
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
      <div className={`${panel} p-6 text-center text-sm text-stone-500`}>
        No payments recorded yet.
      </div>
    );
  return (
    <div className={`${panel} divide-y divide-white/5 px-4 sm:px-5`}>
      {payments.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-stone-200">
              {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
              {p.createdAt &&
                ` · ${new Date(p.createdAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}`}
            </div>
            <div className="text-xs text-stone-500 break-words">
              {p.method}
              {p.note ? ` · ${p.note}` : ""}
            </div>
          </div>
          <div className="shrink-0 font-semibold text-white">₹{p.amount}</div>
        </div>
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
      <div className={`${panel} p-6 text-center text-sm text-stone-500`}>
        No renewals yet.
      </div>
    );
  return (
    <div className={`${panel} divide-y divide-white/5 px-4 sm:px-5`}>
      {rows.map((h) => (
        <div key={h.id} className="py-3">
          <div className="text-sm font-medium text-stone-200">{h.planName}</div>
          <div className="text-xs text-stone-500 mt-0.5">
            {new Date(h.startDate).toLocaleDateString("en-IN")} →{" "}
            {new Date(h.expiryDate).toLocaleDateString("en-IN")} ·{" "}
            {h.durationDays}d
            {h.amountPaid !== null
              ? ` · ₹${h.amountPaid} collected`
              : " · from advance"}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-3 py-3 text-sm">
      <span className="text-stone-500 shrink-0">{label}</span>
      <span className={`font-medium text-right break-words min-w-0 ${valueClass}`}>{value}</span>
    </div>
  );
}