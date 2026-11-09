import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import BuyLicenceButton from "../components/BuyLicenceButton.js";
import Card from "../components/ui/Card.js";

export default function TrialExpired() {
  const { logout } = useAuth();
  const { gym } = useGym();

  const status = gym?.status || "TRIAL_EXPIRED";
  const gymName = gym?.name ? gym.name : "Your gym";

  let icon: React.ReactNode;
  let title: string;
  let message: string;
  let showBuyButton = false;

  switch (status) {
    case "TRIAL_EXPIRED":
      icon = (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
      title = "Trial ended";
      message = `${gymName}'s trial has expired. Purchase a licence to keep using Palastra. Your data is safe.`;
      showBuyButton = true;
      break;

    case "SUSPENDED":
      icon = (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M4.93 4.93l14.14 14.14" />
        </svg>
      );
      title = "Account suspended";
      message = `${gymName}'s account has been suspended. Contact support at palastrasupport@gmail.com to resolve this.`;
      break;

    case "REJECTED":
      icon = (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      );
      title = "Registration not approved";
      message = `${gymName}'s registration was not approved. Contact support at palastrasupport@gmail.com for details.`;
      break;

    case "CANCELLED":
      icon = (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
      title = "Account cancelled";
      message = `${gymName}'s account has been cancelled. Contact support at palastrasupport@gmail.com if this was in error.`;
      break;

    default:
      icon = (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
      title = "Access restricted";
      message = "Contact support at palastrasupport@gmail.com for assistance.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full space-y-4">
        <Card className="p-8 text-center space-y-4">
          <div
            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
              status === "TRIAL_EXPIRED"
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {icon}
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{message}</p>

          {showBuyButton && (
            <>
              <div className="pt-2">
                <BuyLicenceButton />
              </div>
              <p className="text-xs text-slate-500">
                ₹1,999 one-time · Free maintenance for year 1 · Secure via
                Razorpay
              </p>
            </>
          )}

          {status === "SUSPENDED" && (
            <div className="pt-2">
              <a
                href="mailto:palastrasupport@gmail.com"
                className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
              >
                Email support
              </a>
            </div>
          )}
        </Card>

        <div className="text-center">
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
