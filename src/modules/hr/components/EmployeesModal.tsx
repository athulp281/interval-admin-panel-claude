import { useEffect, useState } from "react";
import { useHrStore } from "@/stores/hrStore";
import EmployeeAvatarCard from "./EmployeeAvatarCard";
import Modal from "./Modal";

interface EmployeesModalProps {
  open: boolean;
  onClose: () => void;
  /** Title of the modal — usually department or wing name. */
  title: string;
  /**
   * One of two modes:
   * - `byFilter`: paginated, takes a department + optional wing name.
   * - `byHead`: non-paginated, takes a head id (used by OGD wings).
   */
  mode:
    | { type: "byFilter"; departmentName?: string; wingName?: string }
    | { type: "byHead"; headId: string };
}

const PAGE_SIZE = 12;

export default function EmployeesModal({ open, onClose, title, mode }: EmployeesModalProps) {
  const fetchEmployees = useHrStore((s) => s.fetchEmployees);
  const fetchEmployeesUnderHead = useHrStore((s) => s.fetchEmployeesUnderHead);
  const employees = useHrStore((s) => s.employees);
  const employeesLoading = useHrStore((s) => s.employeesLoading);
  const employeesUnderHead = useHrStore((s) => s.employeesUnderHead);
  const employeesUnderHeadLoading = useHrStore((s) => s.employeesUnderHeadLoading);
  const resetEmployees = useHrStore((s) => s.resetEmployees);

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    if (mode.type === "byHead") {
      fetchEmployeesUnderHead(mode.headId);
    } else {
      fetchEmployees(
        {
          departmentFilter: mode.departmentName ? [mode.departmentName] : undefined,
          wingFilter: mode.wingName ? [mode.wingName] : undefined,
        },
        { page: 1, limit: PAGE_SIZE }
      );
    }
    return () => {
      resetEmployees();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || mode.type !== "byFilter") return;
    fetchEmployees(
      {
        departmentFilter: mode.departmentName ? [mode.departmentName] : undefined,
        wingFilter: mode.wingName ? [mode.wingName] : undefined,
      },
      { page, limit: PAGE_SIZE }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isLoading =
    mode.type === "byHead" ? employeesUnderHeadLoading : employeesLoading;
  const list =
    mode.type === "byHead" ? employeesUnderHead ?? [] : employees?.employees ?? [];
  const meta = mode.type === "byFilter" ? employees?.meta : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Employees"
      subtitle={title}
      size="xl"
    >
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50"
            />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No employees found.
        </p>
      )}

      {!isLoading && list.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((e) => (
              <EmployeeAvatarCard key={e.id} employee={e} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">
                Page {meta.page} of {meta.totalPages} · {meta.totalCount} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
