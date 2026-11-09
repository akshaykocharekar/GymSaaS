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

  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
    isLast: i === parts.length - 1,
  }));

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-200 selection:bg-orange-400/30">
      <div className="flex">
        {/* ─── Desktop sidebar ─────────────────────────── */}
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-[#0c0a09]">
          <div className="px-5 py-6 border-b border-white/5">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-400 text-sm font-bold text-orange-950">
                G
              </span>
              Palastra
            </Link>
            <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-400">
              <span className="h-px w-4 bg-orange-400/60" />
              Admin
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `relative block rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
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

          <div className="px-3 py-4 border-t border-white/5 space-y-1">
            <div className="px-3.5 py-1.5 text-[11px] text-stone-500 truncate">
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="w-full text-left rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-400 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* ─── Top bar (+ mobile nav row) ───────────────── */}
          <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0c0a09]/80 backdrop-blur-xl">
            <header className="flex h-12 items-center justify-between gap-2 px-3 sm:px-6 lg:h-14">
              {/* Breadcrumbs */}
              <div className="flex min-w-0 items-center gap-1.5 truncate text-sm text-stone-500">
                {crumbs.map((c, i) => (
                  <span
                    key={c.href}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {i > 0 && <span className="text-stone-700">/</span>}
                    {c.isLast ? (
                      <span className="truncate font-medium text-white">
                        {c.label}
                      </span>
                    ) : (
                      <Link
                        to={c.href}
                        className="truncate transition-colors hover:text-stone-200"
                      >
                        {c.label}
                      </Link>
                    )}
                  </span>
                ))}
              </div>

              {/* Mobile logout */}
              <button
                onClick={logout}
                className="lg:hidden shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-stone-300 transition-colors hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
              >
                Log out
              </button>
            </header>

            {/* Mobile nav: scrollable pills */}
            <nav className="lg:hidden flex gap-1.5 overflow-x-auto px-3 pb-2.5 sm:px-6 scrollbar-hide">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-orange-400 text-orange-950"
                        : "bg-white/[0.05] text-stone-400 hover:bg-white/[0.08] hover:text-stone-200"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <main className="pb-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}