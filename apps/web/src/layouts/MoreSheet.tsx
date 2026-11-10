import { Link } from "react-router-dom";
import Sheet from "../components/ui/Sheet.js";
import { useAuth } from "../context/AuthContext.js";
import type { Permission } from "@gymora/shared";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ItemDef {
  to: string;
  label: string;
  perm?: Permission;
  ownerOnly?: boolean;
}

const items: ItemDef[] = [
  { to: "/app/plans", label: "Membership Plans", perm: "VIEW_PLANS" },
  { to: "/app/trainers", label: "Trainers", perm: "VIEW_TRAINERS" },
  { to: "/app/reports", label: "Reports", perm: "VIEW_REPORTS" },
  { to: "/app/insights", label: "Insights", perm: "VIEW_REPORTS" },
  { to: "/app/billing", label: "Billing", ownerOnly: true },
  { to: "/app/staff", label: "Staff", ownerOnly: true },
  { to: "/app/profile", label: "Gym Profile" },
];

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-stone-600 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-300"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function MoreSheet({ open, onClose }: Props) {
  const { logout, user, hasPermission } = useAuth();
  const isOwner = user?.role === "OWNER";

  const visible = items.filter((i) => {
    if (i.ownerOnly) return isOwner;
    if (i.perm) return hasPermission(i.perm);
    return true;
  });

  return (
    <Sheet open={open} onClose={onClose} title="More">
      <div className="space-y-1">
        {visible.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            onClick={onClose}
            className="group flex items-center justify-between gap-3 rounded-xl px-3.5 py-3.5 font-medium text-stone-200 transition-colors hover:bg-white/[0.05] hover:text-white active:bg-white/[0.08]"
          >
            {i.label}
            <Chevron />
          </Link>
        ))}

        <div className="my-2 border-t border-white/5" />

        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full rounded-xl px-3.5 py-3.5 text-left font-medium text-rose-300 transition-colors hover:bg-rose-400/10 hover:text-rose-200 active:bg-rose-400/15"
        >
          Log out
        </button>
      </div>
    </Sheet>
  );
}