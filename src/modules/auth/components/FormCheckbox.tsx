import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(function FormCheckbox(
  { label, error, id, className = "", ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={inputId} className="flex items-start gap-3 cursor-pointer select-none">
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 ${className}`}
        />
        <span className="text-sm font-normal text-gray-700 dark:text-gray-400">{label}</span>
      </label>
      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
});

export default FormCheckbox;
