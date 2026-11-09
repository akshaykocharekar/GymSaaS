import { Route, Routes, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.js";
import Register from "./pages/Register.js";
import Login from "./pages/Login.js";
import Activate from "./pages/Activate.js";
import Dashboard from "./pages/Dashboard.js";
import Members from "./pages/Members.js";
import MemberNew from "./pages/MemberNew.js";
import MemberDetail from "./pages/MemberDetail.js";
import Plans from "./pages/Plans.js";
import Payments from "./pages/Payments.js";
import PaymentNew from "./pages/PaymentNew.js";
import Expiries from "./pages/Expiries.js";
import Reports from "./pages/Reports.js";
import Insights from "./pages/Insights.js";
import Trainers from "./pages/Trainers.js";
import TrainerDetail from "./pages/TrainerDetail.js";
import Billing from "./pages/Billing.js";
import BillingSuccess from "./pages/BillingSuccess.js";
import TrialExpired from "./pages/TrialExpired.js";
import Staff from "./pages/Staff.js";
import Profile from "./pages/Profile.js";
import AdminRegistrations from "./pages/AdminRegistrations.js";
import AdminDashboard from "./pages/admin/AdminDashboard.js";
import AdminGyms from "./pages/admin/AdminGyms.js";
import AdminGymDetail from "./pages/admin/AdminGymDetail.js";
import AdminPayments from "./pages/admin/AdminPayments.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import AppLayout from "./layouts/AppLayout.js";
import AdminLayout from "./layouts/AdminLayout.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/trial-expired" element={<TrialExpired />} />

      <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/gyms" element={<AdminGyms />} />
          <Route path="/admin/gyms/:id" element={<AdminGymDetail />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute
            roles={["OWNER", "STAFF"]}
            blockStatuses={[
              "PENDING_APPROVAL",
              "APPROVED",
              "TRIAL_EXPIRED",
              "SUSPENDED",
              "REJECTED",
              "CANCELLED",
            ]}
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
          <Route path="/app/insights" element={<Insights />} />
          <Route path="/app/trainers" element={<Trainers />} />
          <Route path="/app/trainers/:id" element={<TrainerDetail />} />
          <Route path="/app/billing" element={<Billing />} />
          <Route path="/app/billing/success" element={<BillingSuccess />} />
          <Route path="/app/staff" element={<Staff />} />
          <Route path="/app/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}