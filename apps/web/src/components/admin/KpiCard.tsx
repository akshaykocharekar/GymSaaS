import { Link } from "react-router-dom";

interface Props {
  label: string;
  value: number | string | undefined;
  hint?: string;
  to?: string;
  tone?: "default" | "warn" | "danger" | "success";
}

const toneClass: Record<string, string> = {
  default: "text-slate-900",
  warn: "text-amber-600",
  danger: "text-rose-600",
  success: "text-emerald-600",
};

export default function KpiCard({
  label,
  value,
  hint,
  to,
  tone = "default",
}: Props) {
  const inner = (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors h-full">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${
          toneClass[tone]
        }`}
      >
        {value === undefined ? (
          <span className="inline-block w-12 h-6 bg-slate-100 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}