import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { useGym } from "../context/GymContext.js";
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
  { to: "/app/insights", label: "Insights", perm: "VIEW_REPORTS" },
  { to: "/app/billing", label: "Billing", ownerOnly: true },
  { to: "/app/staff", label: "Staff", ownerOnly: true },
  { to: "/app/profile", label: "Gym Profile" },
];

export default function Sidebar() {
  const { logout, user, hasPermission } = useAuth();
  const { gym } = useGym();
  const isOwner = user?.role === "OWNER";

  const visible = links.filter((l) => {
    if (l.ownerOnly) return isOwner;
    if (l.perm) return hasPermission(l.perm);
    return true;
  });

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-white/5 bg-[#0c0a09] h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-white">
          {gym?.logoUrl ? (
            <img 
              src={gym.logoUrl} 
              alt={gym.name} 
              className="h-8 w-8 rounded-lg object-cover bg-white/10" 
              onError={(e) => {
                // If the image fails to load, hide it and show the fallback
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <img 
            src="/logo.svg" 
            alt="Palastra" 
            className={`logo-fallback h-8 w-8 drop-shadow-md ${gym?.logoUrl ? 'hidden' : ''}`} 
          />
          <span className="truncate max-w-[150px]">{gym?.name || "Palastra"}</span>
        </div>
        <div className="mt-3 truncate text-xs text-stone-500">
          {user?.email}
        </div>
        {user?.role === "STAFF" && (
          <div className="mt-2 inline-flex rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400 ring-1 ring-white/10">
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
              `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-400/10 text-orange-200 ring-1 ring-orange-400/20"
                  : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-100"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/5">
        
        <button
          onClick={logout}
          className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-stone-400 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}