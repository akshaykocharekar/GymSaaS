import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
import BuyLicenceButton from "../components/BuyLicenceButton.js";
import Card from "../components/ui/Card.js";

export default function TrialExpired() {
  const { logout } = useAuth();
  const { gym } = useGym();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0a09] text-stone-200">
      <div className="max-w-md w-full space-y-4">
        <Card className="p-8 text-center space-y-4 bg-[#14110f] border border-white/10">
          <div className="w-14 h-14 mx-auto rounded-full bg-orange-400/10 text-orange-400 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Access restricted</h1>
          <p className="text-sm text-stone-400">
            {gym?.name ? `Your ${gym.name} trial has ended.` : "Your trial has ended."}{" "}
            Purchase a licence to continue using Palastra. Your data is safe.
          </p>
          <div className="pt-2">
            <BuyLicenceButton />
          </div>
          <p className="text-xs text-stone-500">
            ₹1,999 one-time · Free maintenance for year 1 · Secure via Razorpay
          </p>
        </Card>
        <div className="text-center">
          <button onClick={logout} className="text-sm text-stone-400 hover:text-white">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
