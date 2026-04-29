import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaginationExample from "@/components/ui/pagination/PaginationExample";
import React from "react";

export default function Pagination() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pagination" />
      <PaginationExample />
    </div>
  );
}
