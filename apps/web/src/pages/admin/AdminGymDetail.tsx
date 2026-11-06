import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/api.js";
import Card from "../../components/ui/Card.js";
import Badge from "../../components/ui/Badge.js";
import Button from "../../components/ui/Button.js";
import Skeleton from "../../components/ui/Skeleton.js";
import RelativeTime from "../../components/admin/RelativeTime.js";
import { useToast } from "../../components/Toast.js";

interface Gym {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  trialStartAt: string | null;
  trialExpiresAt: string | null;
  licencePurchasedAt: string | null;
  licenceExpiresAt: string | null;
  suspendedReason: string | null;
  notes: string | null;
  createdAt: string;
  hasActivationCode: boolean;
}

interface Payment {
  id: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  paymentType: string;
  status: string;
  createdAt: string;
}

export default function AdminGymDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [gym, setGym] = useState<Gym | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState(false);
  const [approvalCode, setApprovalCode] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ gym: Gym; payments: Payment[] }>(`/api/admin/gyms/${id}`, true)
      .then((res) => {
        setGym(res.gym);
        setPayments(res.payments);
      })
      .catch(() => nav("/admin/gyms", { replace: true }));
  }, [id, nav]);

  useEffect(() => {
    load();
  }, [load]);

  async function action(path: string, body: object, confirmMsg?: string, successMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(true);
    try {
      const res = await api.post<any>(`/api/admin/gyms/${id}/${path}`, body, true);
      if (res?.activationCode) setApprovalCode(res.activationCode);
      toast.show(successMsg || "Done");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!gym) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canApprove = gym.status === "PENDING_APPROVAL";
  const canReject = gym.status === "PENDING_APPROVAL";
  const canResend = gym.status === "APPROVED";
  const canSuspend = ["ACTIVE_TRIAL", "ACTIVE_PAID", "TRIAL_EXPIRED"].includes(gym.status);
  const canReactivate = gym.status === "SUSPENDED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 truncate">
              {gym.name}
            </h1>
            <Badge status={gym.status} />
          </div>
          <div className="text-sm text-slate-500 mt-0.5">
            {gym.ownerName} · registered <RelativeTime date={gym.createdAt} />
          </div>
        </div>
      </div>

      {approvalCode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
            Activation code
          </div>
          <div className="mt-1 font-mono text-lg text-emerald-900 select-all">
            {approvalCode}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(approvalCode);
              toast.show("Copied");
            }}
            className="mt-1 text-xs text-emerald-700 hover:underline font-medium"
          >
            Copy
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left: info + actions */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
              Details
            </h2>
            <div className="space-y-2.5">
              <Row label="Email" value={gym.email} mono />
              <Row label="Phone" value={gym.phone} />
              <Row label="Address" value={gym.address} />
              {gym.trialExpiresAt && (
                <Row
                  label="Trial expires"
                  value={new Date(gym.trialExpiresAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
              )}
              {gym.licencePurchasedAt && (
                <Row
                  label="Licensed since"
                  value={new Date(gym.licencePurchasedAt).toLocaleDateString(
                    "en-IN",
                    { dateStyle: "medium" }
                  )}
                />
              )}
              {gym.licenceExpiresAt && (
                <Row
                  label="Maintenance until"
                  value={new Date(gym.licenceExpiresAt).toLocaleDateString(
                    "en-IN",
                    { dateStyle: "medium" }
                  )}
                />
              )}
              {gym.suspendedReason && (
                <Row
                  label="Suspension reason"
                  value={gym.suspendedReason}
                  tone="danger"
                />
              )}
            </div>
          </Card>

          {(canApprove || canReject || canResend || canSuspend || canReactivate) && (
            <Card className="p-5">
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
                Actions
              </h2>
              <div className="flex flex-wrap gap-2">
                {canApprove && (
                  <Button
                    size="sm"
                    loading={busy}
                    onClick={() =>
                      action("approve", {}, undefined, "Approved")
                    }
                  >
                    Approve
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const reason = prompt("Reason?");
                      if (reason)
                        action("reject", { reason }, undefined, "Rejected");
                    }}
                  >
                    Reject
                  </Button>
                )}
                {canResend && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busy}
                    onClick={() =>
                      action("resend-code", {}, undefined, "New code generated")
                    }
                  >
                    Resend code
                  </Button>
                )}
                {canSuspend && (
                  <Button
                    size="sm"
                    variant="danger"
                    loading={busy}
                    onClick={() => {
                      const reason = prompt("Reason for suspension?");
                      if (reason)
                        action("suspend", { reason }, undefined, "Suspended");
                    }}
                  >
                    Suspend
                  </Button>
                )}
                {canReactivate && (
                  <Button
                    size="sm"
                    loading={busy}
                    onClick={() =>
                      action("reactivate", {}, undefined, "Reactivated")
                    }
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right: payments */}
        <div>
          <Card className="p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
              Payments
            </h2>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">None yet</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-900">
                        ₹{(p.amount / 100).toLocaleString("en-IN")}
                      </div>
                      <Badge status={p.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p.paymentType === "SOFTWARE_PURCHASE"
                        ? "Licence"
                        : "Maintenance"}{" "}
                      · <RelativeTime date={p.createdAt} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-right break-all ${
          tone === "danger"
            ? "text-rose-700 font-medium"
            : "text-slate-900"
        } ${mono ? "font-mono text-[13px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}