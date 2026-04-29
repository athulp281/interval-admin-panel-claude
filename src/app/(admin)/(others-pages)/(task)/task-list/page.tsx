import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import TaskList from "@/components/task/task-list/TaskList";

export default function TaskListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Task List" />
      <TaskList />
    </div>
  );
}
