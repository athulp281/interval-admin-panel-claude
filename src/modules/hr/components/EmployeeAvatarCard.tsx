import type { Employee } from "../api/types";

const PHOTO_BASE_URL =
  "https://workspace.teaminterval.net/assets/employee/photo/passport_size";

interface Props {
  employee: Employee;
}

export default function EmployeeAvatarCard({ employee }: Props) {
  const initial = employee.name?.charAt(0)?.toUpperCase() ?? "?";
  const src = employee.photo ? `${PHOTO_BASE_URL}/${employee.photo}.jpg` : null;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full ring-2 ring-brand-500/40">
        {src ? (
          <img
            src={src}
            alt={employee.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="absolute inset-0 -z-0 flex items-center justify-center bg-brand-50 text-2xl font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          {initial}
        </div>
      </div>
      <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
        {employee.name}
      </p>
      {employee.designation && (
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {employee.designation}
        </p>
      )}
    </div>
  );
}
