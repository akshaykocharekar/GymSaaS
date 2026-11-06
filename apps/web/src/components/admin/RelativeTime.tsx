interface Props {
  date: string | Date;
  className?: string;
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;

  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  let label: string;
  if (mins < 1) label = "just now";
  else if (mins < 60) label = `${mins}m`;
  else if (hours < 24) label = `${hours}h`;
  else if (days < 30) label = `${days}d`;
  else label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (future && label !== "just now") return `in ${label}`;
  if (!future && label !== "just now") return `${label} ago`;
  return label;
}

export default function RelativeTime({ date, className = "" }: Props) {
  const d = typeof date === "string" ? new Date(date) : date;
  const exact = d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <span title={exact} className={className}>
      {formatRelative(d)}
    </span>
  );
}