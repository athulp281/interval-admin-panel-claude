import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, required, error, hint, rightSlot, className = "", id, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  const base =
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
  const stateClasses = error
    ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500"
    : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800";

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          {label}
          {required && <span className="text-error-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          className={`${base} ${stateClasses} ${className}`}
        />
        {rightSlot && (
          <span className="absolute z-30 -translate-y-1/2 right-4 top-1/2">{rightSlot}</span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-error-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default FormInput;
