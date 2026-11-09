import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import type { Permission } from "@gymora/shared";

interface LinkDef {
  to: string;
  label: string;
  perm?: Permission;
  ownerOnly?: boolean;
}

const links: LinkDef[] = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/members", label: "Members", perm: "VIEW_MEMBERS" },
  { to: "/app/payments", label: "Payments", perm: "VIEW_PAYMENTS" },
  { to: "/app/expiries", label: "Expiries", perm: "VIEW_EXPIRIES" },
  { to: "/app/plans", label: "Plans", perm: "VIEW_PLANS" },
  { to: "/app/trainers", label: "Trainers", perm: "VIEW_TRAINERS" },
  { to: "/app/reports", label: "Reports", perm: "VIEW_REPORTS" },
  { to: "/app/billing", label: "Billing", ownerOnly: true },
  { to: "/app/staff", label: "Staff", ownerOnly: true },
  { to: "/app/profile", label: "Gym Profile" },
];

export default function Sidebar() {
  const { logout, user, hasPermission } = useAuth();
  const isOwner = user?.role === "OWNER";

  const visible = links.filter((l) => {
    if (l.ownerOnly) return isOwner;
    if (l.perm) return hasPermission(l.perm);
    return true;
  });

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 bg-white min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="text-xl font-bold text-primary-600 tracking-tight">
          Gymora
        </div>
        <div className="text-xs text-slate-500 mt-1 truncate">
          {user?.email}
        </div>
        {user?.role === "STAFF" && (
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
            Staff
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visible.map((l) => (
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