import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function Card({ children, className = "", onClick, interactive }: Props) {
  const base = "bg-white rounded-2xl shadow-card";
  const hover = interactive ? "hover:shadow-elevated transition-shadow cursor-pointer" : "";
  return (
    <div onClick={onClick} className={`${base} ${hover} ${className}`}>
      {children}
    </div>
  );
}