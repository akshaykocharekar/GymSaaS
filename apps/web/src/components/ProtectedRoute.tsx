import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import type { AuthUser } from "../lib/auth.js";

interface Props {
  roles?: AuthUser["role"][];
  blockStatuses?: string[];
  redirectTo?: string;
}

const STATUS_ROUTES: Record<string, string> = {
  PENDING_APPROVAL: "/register?status=pending",
  APPROVED: "/activate",
  TRIAL_EXPIRED: "/trial-expired",
  SUSPENDED: "/trial-expired",
  REJECTED: "/trial-expired",
  CANCELLED: "/trial-expired",
};

export default function ProtectedRoute({
  roles,
  blockStatuses,
  redirectTo = "/login",
}: Props) {
  const { user, gymStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to={redirectTo} replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "SUPERADMIN"
            ? "/admin/registrations"
            : "/app/dashboard"
        }
        replace
      />
    );
  }

  if (blockStatuses && gymStatus && blockStatuses.includes(gymStatus)) {
    const target = STATUS_ROUTES[gymStatus] || "/trial-expired";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
