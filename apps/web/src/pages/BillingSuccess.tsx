import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useGym } from "../context/GymContext.js";
import Card from "../components/ui/Card.js";

interface LicenceStatus {
  ok: boolean;
  status: string;
  licencePurchasedAt: string | null;
  licenceExpiresAt: string | null;
}

export default function BillingSuccess() {
  const { gym, refresh } = useGym();
  const [status, setStatus] = useState<LicenceStatus | null>(null);

  useEffect(() => {
    refresh();
    api
      .get<LicenceStatus>("/api/gym/licence/status", true)
      .then((res) => setStatus(res));
  }, [refresh]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Payment successful
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Thank you — your Palastra licence is now active.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Receipt
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Gym" value={gym?.name || "—"} />
            <Row label="Licence" value="Software licence — one-time" />
            <Row label="Amount paid" value="₹1,999" />
            {status?.licencePurchasedAt && (
              <Row
                label="Purchased on"
                value={new Date(status.licencePurchasedAt).toLocaleString(
                  "en-IN",
                  { dateStyle: "medium", timeStyle: "short" }
                )}
              />
            )}
            {status?.licenceExpiresAt && (
              <Row
                label="Maintenance until"
                value={new Date(status.licenceExpiresAt).toLocaleDateString(
                  "en-IN",
                  { dateStyle: "medium" }
                )}
              />
            )}
            <Row label="Status" value="ACTIVE — Licensed" />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          A copy of this receipt will be emailed to you shortly. For any
          questions, contact palastrasupport@gmail.com.
        </p>

        <div className="pt-2">
          <Link
            to="/app/dashboard"
            className="block w-full text-center px-5 py-2.5 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800"
          >
            Go to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}