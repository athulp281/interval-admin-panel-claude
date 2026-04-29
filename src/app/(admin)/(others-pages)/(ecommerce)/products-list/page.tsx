import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductListTable from "@/components/ecommerce/ProductListTable";
import React from "react";

export default function ProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Products" />
      <ProductListTable />
    </div>
  );
}
