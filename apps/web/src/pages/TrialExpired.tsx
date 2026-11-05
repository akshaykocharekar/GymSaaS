import { useAuth } from "../context/AuthContext.js";

export default function TrialExpired() {
  const { logout, gymStatus } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
</div>
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