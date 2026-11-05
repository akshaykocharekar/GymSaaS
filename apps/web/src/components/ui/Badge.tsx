type Status = "ACTIVE" | "EXPIRED" | "INACTIVE" | "PENDING" | string;

interface Props {
  status: Status;
  children?: React.ReactNode;
}

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 ring-green-600/20",
  EXPIRED: "bg-red-50 text-red-700 ring-red-600/20",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export default function Badge({ status, children }: Props) {
  const style = statusStyle[status] || statusStyle.INACTIVE;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {children ?? status}
    </span>
  );
}