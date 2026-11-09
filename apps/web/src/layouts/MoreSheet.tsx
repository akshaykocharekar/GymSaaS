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
            className="block px-3 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            {i.label}
          </Link>
        ))}
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full text-left px-3 py-3 rounded-lg text-danger hover:bg-red-50 font-medium"
        >
          Log out
        </button>
      </div>
    </Sheet>
  );
}