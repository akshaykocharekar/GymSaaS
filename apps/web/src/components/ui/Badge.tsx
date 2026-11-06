type Status = string;

interface Props {
  status: Status;
  children?: React.ReactNode;
  dot?: boolean;
}

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE_PAID: {
    bg: "bg-emerald-50 ring-emerald-600/20",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  ACTIVE_TRIAL: {
    bg: "bg-blue-50 ring-blue-600/20",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  PENDING_APPROVAL: {
    bg: "bg-amber-50 ring-amber-600/20",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  APPROVED: {
    bg: "bg-indigo-50 ring-indigo-600/20",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  TRIAL_EXPIRED: {
    bg: "bg-slate-100 ring-slate-500/20",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  SUSPENDED: {
    bg: "bg-rose-50 ring-rose-600/20",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  REJECTED: {
    bg: "bg-rose-50 ring-rose-600/20",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  CANCELLED: {
    bg: "bg-slate-100 ring-slate-500/20",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  ACTIVE: {
    bg: "bg-emerald-50 ring-emerald-600/20",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  EXPIRED: {
    bg: "bg-rose-50 ring-rose-600/20",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  INACTIVE: {
    bg: "bg-slate-100 ring-slate-500/20",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  PAID: {
    bg: "bg-emerald-50 ring-emerald-600/20",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CREATED: {
    bg: "bg-amber-50 ring-amber-600/20",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  FAILED: {
    bg: "bg-rose-50 ring-rose-600/20",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

const fallback = {
  bg: "bg-slate-100 ring-slate-500/20",
  text: "text-slate-600",
  dot: "bg-slate-400",
};

export default function Badge({ status, children, dot = true }: Props) {
  const style = statusStyle[status] || fallback;
  const label = children ?? status.replace(/_/g, " ").toLowerCase();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset capitalize ${style.bg} ${style.text}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {label}
    </span>
  );
}