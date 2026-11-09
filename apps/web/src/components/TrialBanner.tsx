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
    ? "bg-red-50 border-red-200 text-red-900"
    : daysLeft !== null && daysLeft <= 5
    ? "bg-amber-50 border-amber-200 text-amber-900"
    : "bg-primary-50 border-primary-200 text-primary-900";

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
            className="px-3 py-1 rounded-md bg-white/70 hover:bg-white text-xs font-medium"
          >
            Buy ₹1,999
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5"
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
