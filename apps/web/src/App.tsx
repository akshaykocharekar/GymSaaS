import { Route, Routes, Navigate, Link } from "react-router-dom";
import Register from "./pages/Register.js";
import Login from "./pages/Login.js";
import Activate from "./pages/Activate.js";
import AdminRegistrations from "./pages/AdminRegistrations.js";
import Dashboard from "./pages/Dashboard.js";
import TrialExpired from "./pages/TrialExpired.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-4xl font-bold text-primary-600">Gymora</div>
        <p className="text-slate-600">
          Run Your Gym Smarter. Manage Everything in One Place.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Register Your Gym
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/trial-expired" element={<TrialExpired />} />

      {/* Superadmin */}
      <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
      </Route>

      {/* Gym owner / staff — blocked when gym suspended or trial expired */}
      <Route
        element={
          <ProtectedRoute
            roles={["OWNER", "STAFF"]}
            blockStatuses={["TRIAL_EXPIRED", "SUSPENDED", "REJECTED", "CANCELLED"]}
          />
        }
      >
        <Route path="/app/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}