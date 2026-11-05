import { Link } from "react-router-dom";

interface Props {
  to: string;
  label: string;
}

export default function FAB({ to, label }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-transform"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}