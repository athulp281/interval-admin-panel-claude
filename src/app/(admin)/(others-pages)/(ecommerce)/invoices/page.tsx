import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InvoiceListTable from "@/components/invoice/InvoiceList";
import InvoiceMetrics from "@/components/invoice/InvoiceMetrics";
import React from "react";

export default function InvoicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />
      <InvoiceMetrics />
      <InvoiceListTable />
    </div>
  );
}
