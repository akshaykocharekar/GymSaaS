interface Props {
  className?: string;
}

export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] motion-reduce:animate-none ${className}`}
    />
  );
}