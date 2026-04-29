import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export default function SubmitButton({
  loading,
  disabled,
  children,
  className = "",
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      {...rest}
      type={rest.type ?? "submit"}
      disabled={loading || disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
