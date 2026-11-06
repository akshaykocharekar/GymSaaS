import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/registrations", label: "Pending" },
  { to: "/admin/gyms", label: "Gyms" },
  { to: "/admin/payments", label: "Payments" },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();

  // Build breadcrumbs from pathname
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
    isLast: i === parts.length - 1,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-56 bg-[#0a0a0b] min-h-screen sticky top-0">
          <div className="px-5 py-6 border-b border-white/5">
            <Link
              to="/admin"
              className="text-[15px] font-semibold tracking-tight text-white"
            >
              Gymora
            </Link>
            <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">
              Admin
            </div>
          </div>

          <nav className="flex-1 px-2.5 py-4 space-y-0.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-2.5 py-4 border-t border-white/5 space-y-1">
            <div className="px-3 py-1.5 text-[11px] text-slate-500 truncate">
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium text-slate-400 hover:bg-white/[0.04] hover:text-rose-300 transition-colors"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-1.5 text-sm text-slate-500 truncate">
              {crumbs.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {c.isLast ? (
                    <span className="text-slate-900 font-medium truncate">
                      {c.label}
                    </span>
                  ) : (
                    <Link
                      to={c.href}
                      className="hover:text-slate-900 truncate"
                    >
                      {c.label}
                    </Link>
                  )}
                </span>
              ))}
            </div>

            {/* Mobile nav dropdown */}
            <nav className="lg:hidden flex gap-1">
              {links.slice(0, 4).map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `px-2 py-1 rounded text-xs font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="pb-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}