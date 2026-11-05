import { useAuth } from "../context/AuthContext.js";

export default function TrialExpired() {
  const { logout, gymStatus } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">Access restricted</h1>
        <p className="text-slate-600">
          Your account status is <span className="font-mono">{gymStatus}</span>.
          Purchase a licence to continue using Gymora. Your data is safe.
        </p>
        <p className="text-sm text-slate-500">
          Razorpay purchase flow arrives in Phase 5.
        </p>
        <button
          onClick={logout}
          className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}