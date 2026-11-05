import { Route, Routes, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.js";
import Register from "./pages/Register.js";
import Login from "./pages/Login.js";
import Activate from "./pages/Activate.js";
import AdminRegistrations from "./pages/AdminRegistrations.js";
import Dashboard from "./pages/Dashboard.js";
import Members from "./pages/Members.js";
import MemberNew from "./pages/MemberNew.js";
import MemberDetail from "./pages/MemberDetail.js";
import Plans from "./pages/Plans.js";
import Payments from "./pages/Payments.js";
import PaymentNew from "./pages/PaymentNew.js";
import Expiries from "./pages/Expiries.js";
import Reports from "./pages/Reports.js";
import TrialExpired from "./pages/TrialExpired.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import AppLayout from "./layouts/AppLayout.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/trial-expired" element={<TrialExpired />} />

      <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
      </Route>

      <Route
        element={
          <ProtectedRoute
            roles={["OWNER", "STAFF"]}
            blockStatuses={["TRIAL_EXPIRED", "SUSPENDED", "REJECTED", "CANCELLED"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/members" element={<Members />} />
          <Route path="/app/members/new" element={<MemberNew />} />
          <Route path="/app/members/:id" element={<MemberDetail />} />
          <Route path="/app/plans" element={<Plans />} />
          <Route path="/app/payments" element={<Payments />} />
          <Route path="/app/payments/new" element={<PaymentNew />} />
          <Route path="/app/expiries" element={<Expiries />} />
          <Route path="/app/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}