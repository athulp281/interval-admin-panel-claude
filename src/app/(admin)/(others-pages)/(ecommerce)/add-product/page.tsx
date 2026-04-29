import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddProductForm from "@/components/ecommerce/AddProductForm";

export default function AddProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Products" />
      <AddProductForm />
    </div>
  );
}
