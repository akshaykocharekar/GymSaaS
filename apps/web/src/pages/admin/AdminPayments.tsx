import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import Badge from "../../components/ui/Badge.js";
import AdminTable, { type Column } from "../../components/admin/AdminTable.js";
import RelativeTime from "../../components/admin/RelativeTime.js";

interface Payment {
  id: string;
  gymId: string;
  gymName: string;
  gymEmail: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  paymentType: string;
  status: string;
  createdAt: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    api
      .get<{ payments: Payment[] }>("/api/admin/licence-payments", true)
      .then((res) => setPayments(res.payments));
  }, []);

  const columns: Column<Payment>[] = [
    {
      key: "gym",
      header: "Gym",
      render: (p) => (
        <Link
          to={`/admin/gyms/${p.gymId}`}
          className="hover:underline block"
        >
          <div className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
            {p.gymName}
          </div>
          <div className="text-xs text-slate-500 truncate max-w-[180px]">
            {p.gymEmail}
          </div>
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (p) => (
        <span className="text-xs text-slate-600">
          {p.paymentType === "SOFTWARE_PURCHASE" ? "Licence" : "Maintenance"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (p) => (
        <span className="text-sm font-medium tabular-nums text-slate-900">
          ₹{(p.amount / 100).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge status={p.status} />,
    },
    {
      key: "order",
      header: "Order",
      hideOnMobile: true,
      render: (p) => (
        <span className="text-[11px] font-mono text-slate-500">
          {p.orderId.slice(0, 20)}…
        </span>
      ),
    },
    {
      key: "created",
      header: "When",
      hideOnMobile: true,
      render: (p) => (
        <RelativeTime date={p.createdAt} className="text-xs text-slate-500" />
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Payments
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Licence purchases across all gyms
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={payments || []}
        keyFn={(p) => p.id}
        loading={payments === null}
        empty={
          <div className="text-sm text-slate-500">
            No payments recorded yet.
          </div>
        }
      />
    </div>
  );
}