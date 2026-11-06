import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormField({ label, error, id, ...rest }: Props) {
  const fieldId = id || rest.name || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-stone-300">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
        className={`w-full rounded-xl border bg-white/[0.04] px-3.5 py-3 text-base sm:text-sm text-white placeholder:text-stone-600 outline-none transition focus:bg-white/[0.06] focus:ring-4 disabled:opacity-60 ${
          error
            ? "border-rose-400/50 focus:border-rose-400/70 focus:ring-rose-400/10"
            : "border-white/10 focus:border-orange-400/60 focus:ring-orange-400/10"
        }`}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}