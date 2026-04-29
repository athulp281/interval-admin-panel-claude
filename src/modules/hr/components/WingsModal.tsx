import { useState } from "react";
import type { DepartmentNode, Wing } from "../api/types";
import EmployeesModal from "./EmployeesModal";
import Modal from "./Modal";

interface WingsModalProps {
  open: boolean;
  onClose: () => void;
  department: DepartmentNode;
}

export default function WingsModal({ open, onClose, department }: WingsModalProps) {
  const [activeWing, setActiveWing] = useState<Wing | null>(null);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Wings"
        subtitle={department.department}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {department.wings.map((wing) => (
            <div
              key={wing.headId}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {wing.wingName}
                  </h3>
                  <p className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {wing.wingHead}
                  </p>
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {wing.count}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveWing(wing)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                View employees
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {activeWing && (
        <EmployeesModal
          open={Boolean(activeWing)}
          onClose={() => setActiveWing(null)}
          title={`${department.department} · ${activeWing.wingName}`}
          mode={
            department.wingsUseHeadIdLookup
              ? { type: "byHead", headId: activeWing.headId }
              : {
                  type: "byFilter",
                  departmentName: department.department,
                  wingName: activeWing.wingName,
                }
          }
        />
      )}
    </>
  );
}
