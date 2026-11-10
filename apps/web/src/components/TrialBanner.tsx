import { useState } from "react";
import { Link } from "react-router-dom";
import { useGym } from "../context/GymContext.js";

export default function TrialBanner() {
  const { gym } = useGym();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !gym) return null;

  // Only show for trial-related statuses
  const isTrial = gym.status === "ACTIVE_TRIAL";
  const isExpired = gym.status === "TRIAL_EXPIRED";

  if (!isTrial && !isExpired) return null;

  // Compute days left
  let daysLeft: number | null = null;
  if (isTrial && gym.trialExpiresAt) {
    daysLeft = Math.ceil(
      (new Date(gym.trialExpiresAt).getTime() - Date.now()) / 86_400_000
    );
  }

  // If daysLeft is 0 or negative, treat as expired (cron might not have flipped status yet)
  const effectivelyExpired =
    isExpired || (isTrial && daysLeft !== null && daysLeft <= 0);

  const tone = effectivelyExpired
    ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
    : daysLeft !== null && daysLeft <= 5
    ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
    : "border-amber-400/20 bg-amber-400/10 text-amber-200";

  let message: string;
  if (effectivelyExpired) {
    message = "Your trial has ended. Buy a licence to continue.";
  } else if (daysLeft === 1) {
    message = "1 day left in your trial.";
  } else if (daysLeft !== null) {
    message = `${daysLeft} days left in your trial.`;
  } else {
    message = "Trial active.";
  }

  return (
    <div className={`border-b ${tone}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0 truncate">{message}</div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/app/billing"
            className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-300 transition-colors hover:bg-orange-400/20 hover:text-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"
          >
            Buy ₹1,999
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg opacity-70 transition hover:bg-white/10 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"
            aria-label="Dismiss"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}