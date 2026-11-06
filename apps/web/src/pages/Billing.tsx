import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useGym } from "../context/GymContext.js";
import Card from "../components/ui/Card.js";
import Button from "../components/ui/Button.js";
import Skeleton from "../components/ui/Skeleton.js";
import BuyLicenceButton from "../components/BuyLicenceButton.js";

interface LicenceStatus {
  ok: boolean;
  status: string;
  licencePurchasedAt: string | null;
  licenceExpiresAt: string | null;
  trialExpiresAt: string | null;
  maintenanceDaysLeft: number | null;
  canRenewMaintenance: boolean;
  prices: { licence: number; maintenance: number };
}

export default function Billing() {
  const { gym } = useGym();
  const [status, setStatus] = useState<LicenceStatus | null>(null);

  useEffect(() => {
    api
      .get<LicenceStatus>("/api/gym/licence/status", true)
      .then((res) => setStatus(res));
  }, [gym?.status]);

  if (!status) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isPaid = status.status === "ACTIVE_PAID";
  const isTrial = status.status === "ACTIVE_TRIAL";
  const isExpired = status.status === "TRIAL_EXPIRED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          One-time licence. Optional maintenance.
        </p>
      </div>

      <Card className="p-5">
        <div className="text-sm font-medium text-slate-500 mb-1">
          Current plan
        </div>
        <div className="text-lg font-semibold text-slate-900">
          {isPaid
            ? "Licensed"
            : isTrial
            ? "30-day free trial"
            : isExpired
            ? "Trial expired"
            : status.status}
        </div>
        {status.trialExpiresAt && isTrial && (
          <div className="text-xs text-slate-500 mt-1">
            Trial ends{" "}
            {new Date(status.trialExpiresAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
        {status.licenceExpiresAt && isPaid && (
          <div className="text-xs text-slate-500 mt-1">
            Maintenance renews{" "}
            {new Date(status.licenceExpiresAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {status.maintenanceDaysLeft !== null &&
              ` · ${status.maintenanceDaysLeft} days left`}
          </div>
        )}
      </Card>

      {!isPaid && (
        <Card className="p-6 border-2 border-slate-900">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="text-sm font-medium text-slate-500">
                Software licence
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight">
                  ₹1,999
                </span>
                <span className="text-sm text-slate-500">one-time</span>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Lifetime access to all features",
              "Unlimited members (500 fair-use)",
              "Free maintenance for year 1",
              "₹499/year from year 2 (optional)",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-slate-700">
                <span className="text-emerald-600 mt-0.5 shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <BuyLicenceButton />
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            Secure payment via Razorpay · Test card: 4100 2800 0000 1007
          </p>
        </Card>
      )}

      {isPaid && status.canRenewMaintenance && (
        <Card className="p-6 border border-amber-200 bg-amber-50">
          <div className="text-sm font-medium text-amber-900">
            Maintenance renewal
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tracking-tight">₹499</span>
            <span className="text-sm text-slate-500">/year</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Your maintenance expires in {status.maintenanceDaysLeft} days. Renew
            to keep updates and support.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => {
                // Handled in 5c when maintenance flow is wired
                alert("Maintenance renewal flow — coming in 5c");
              }}
              variant="secondary"
              fullWidth
            >
              Renew maintenance — ₹499
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}