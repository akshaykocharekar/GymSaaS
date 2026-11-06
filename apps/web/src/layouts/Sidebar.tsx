import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

const links = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/members", label: "Members" },
  { to: "/app/payments", label: "Payments" },
  { to: "/app/expiries", label: "Expiries" },
  { to: "/app/plans", label: "Plans" },
  { to: "/app/reports", label: "Reports" },
  { to: "/app/billing", label: "Billing" },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 bg-white min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="text-xl font-bold text-primary-600 tracking-tight">
          Gymora
        </div>
        <div className="text-xs text-slate-500 mt-1 truncate">
          {user?.email}
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}