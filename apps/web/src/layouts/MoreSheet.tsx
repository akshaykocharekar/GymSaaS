import { Link } from "react-router-dom";
import Sheet from "../components/ui/Sheet.js";
import { useAuth } from "../context/AuthContext.js";

interface Props {
  open: boolean;
  onClose: () => void;
}

const items = [
  { to: "/app/plans", label: "Membership Plans" },
  { to: "/app/reports", label: "Reports" },
  { to: "/app/billing", label: "Billing" },
  { to: "/app/staff", label: "Staff" },
  { to: "/app/profile", label: "Gym Profile" },
];

export default function MoreSheet({ open, onClose }: Props) {
  const { logout } = useAuth();
  return (
    <Sheet open={open} onClose={onClose} title="More">
      <div className="space-y-1">
        {items.map((i) => (
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
