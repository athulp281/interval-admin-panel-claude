import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupportTicketsList from "@/components/support/SupportList";
import SupportMetrics from "@/components/support/SupportMetrics";
import React from "react";

export default function SupportListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support List" />
      <SupportMetrics />
      <SupportTicketsList />
    </div>
  );
}
