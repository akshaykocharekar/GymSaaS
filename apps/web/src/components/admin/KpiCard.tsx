import { Link } from "react-router-dom";

interface Props {
  label: string;
  value: number | string | undefined;
  hint?: string;
  to?: string;
  tone?: "default" | "warn" | "danger" | "success";
}

const toneClass: Record<string, string> = {
  default: "text-white",
  warn: "text-amber-300",
  danger: "text-rose-400",
  success: "text-emerald-400",
};

const dotClass: Record<string, string> = {
  warn: "bg-amber-300",
  danger: "bg-rose-400",
  success: "bg-emerald-400",
};

export default function KpiCard({
  label,
  value,
  hint,
  to,
  tone = "default",
}: Props) {
  const inner = (
    <div
      className={`h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:border-orange-400/40 hover:bg-white/[0.05] ${
        to ? "hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
        {dotClass[tone] && (
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass[tone]}`} />
        )}
        {label}
      </div>
      <div
        className={`mt-2 text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight ${
          toneClass[tone]
        }`}
      >
        {value === undefined ? (
          <span className="inline-block w-12 h-7 bg-white/[0.08] rounded-lg animate-pulse" />
        ) : (
          value
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
    </div>
  );
  return to ? (
    <Link
      to={to}
      className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}