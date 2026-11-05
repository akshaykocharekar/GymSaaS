import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/app/dashboard", label: "Home", icon: HomeIcon },
  { to: "/app/members", label: "Members", icon: UsersIcon },
  { to: "/app/payments", label: "Payments", icon: CashIcon },
  { to: "/app/expiries", label: "Expiries", icon: ClockIcon },
  { to: "#more", label: "More", icon: MoreIcon },
];

interface Props {
  onMoreClick: () => void;
}

export default function BottomTabs({ onMoreClick }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 lg:hidden">
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t) =>
          t.to === "#more" ? (
            <button
              key={t.label}
              onClick={onMoreClick}
              className="flex flex-col items-center justify-center py-2 min-h-[56px] text-slate-500 hover:text-slate-900"
            >
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
            </button>
          ) : (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
                  isActive ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
                }`
              }
            >
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}

/* ─── Icons ───────────────────────────────────────────── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <path d="M17 11a3 3 0 1 0 0-6" />
      <path d="M22 21c0-2.8-1.6-5.2-4-6.3" />
    </svg>
  );
}
function CashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}