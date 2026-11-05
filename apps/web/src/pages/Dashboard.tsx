import { useAuth } from "../context/AuthContext.js";

export default function Dashboard() {
  const { user, gymStatus, logout } = useAuth();
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="font-bold text-primary-600 text-lg">Gymora</div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
        <button onClick={logout} className="text-sm text-slate-600 hover:text-danger">
          Log out
        </button>
      </header>
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-2">
          <div className="text-sm text-slate-500">Account status</div>
          <div className="font-medium">{gymStatus || "—"}</div>
          <p className="text-sm text-slate-600 pt-2">
            Phase 2b scaffold. Members, plans, payments, and reports arrive in
            Phase 3.
          </p>
        </div>
      </main>
    </div>
  );
}