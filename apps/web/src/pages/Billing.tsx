import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useGym } from "../context/GymContext.js";
import Skeleton from "../components/ui/Skeleton.js";
import BuyLicenceButton from "../components/BuyLicenceButton.js";
import RenewMaintenanceButton from "../components/RenewMaintenanceButton.js";

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPaid = status.status === "ACTIVE_PAID";
  const isTrial = status.status === "ACTIVE_TRIAL";
  const isExpired = status.status === "TRIAL_EXPIRED";

  const pillClass = isPaid
    ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25"
    : isTrial
    ? "bg-sky-400/10 text-sky-300 ring-sky-400/25"
    : isExpired
    ? "bg-rose-400/10 text-rose-300 ring-rose-400/25"
    : "bg-white/[0.04] text-stone-400 ring-white/10";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Billing</h1>
        <p className="text-sm text-stone-500 mt-1">
          One-time licence · Annual maintenance
        </p>
      </div>

      {/* Current plan */}
      <section>
        <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
          Current plan
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {isPaid
              ? "Licensed"
              : isTrial
              ? "30-day free trial"
              : isExpired
              ? "Trial expired"
              : status.status}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${pillClass}`}
          >
            {isPaid ? "Active" : isTrial ? "Trial" : isExpired ? "Expired" : "Status"}
          </span>
        </div>
        {status.trialExpiresAt && isTrial && (
          <div className="text-sm text-stone-500 mt-1.5">
            Trial ends{" "}
            {new Date(status.trialExpiresAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
        {status.licenceExpiresAt && isPaid && (
          <div className="text-sm text-stone-500 mt-1.5">
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
      </section>

      {/* Buy licence: the one featured panel */}
      {!isPaid && (
        <div
          className="rounded-2xl p-px"
          style={{
            background:
              "linear-gradient(160deg, rgba(251,146,60,0.9), rgba(251,146,60,0.08) 45%, rgba(252,211,77,0.5))",
          }}
        >
          <div className="h-full rounded-[calc(1rem-1px)] bg-[#120f0d] p-5 sm:p-6">
            <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Software licence
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                ₹1,999
              </span>
              <span className="text-sm text-stone-500">one-time</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                "Lifetime access to all features",
                "Unlimited members (500 fair-use)",
                "Free maintenance for year 1",
                "₹499/year maintenance from year 2",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-stone-200">
                  <span className="text-emerald-300 mt-0.5 shrink-0">
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
            <div className="mt-6">
              <BuyLicenceButton />
            </div>
            <p className="text-xs text-stone-500 text-center mt-3">
              Secure payment via Razorpay
            </p>
          </div>
        </div>
      )}

      {/* Maintenance renewal */}
      {isPaid && status.canRenewMaintenance && (
        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 sm:p-6">
          <div className="text-sm font-medium text-amber-200">
            Maintenance renewal
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              ₹499
            </span>
            <span className="text-sm text-stone-400">/year</span>
          </div>
          <p className="text-sm text-stone-300 mt-2">
            Your maintenance expires in {status.maintenanceDaysLeft} days. Renew
            to keep updates and support.
          </p>
          <div className="mt-4">
            <RenewMaintenanceButton />
          </div>
        </section>
      )}

      {/* Maintenance active */}
      {isPaid && !status.canRenewMaintenance && status.maintenanceDaysLeft !== null && (
        <section className="border-t border-white/5 pt-6">
          <div className="text-sm text-stone-400">
            Maintenance is active for{" "}
            <strong className="font-semibold text-stone-200">
              {status.maintenanceDaysLeft} more days
            </strong>
            . You&apos;ll be able to renew starting 30 days before expiry.
          </div>
        </section>
      )}
    </div>
  );
}