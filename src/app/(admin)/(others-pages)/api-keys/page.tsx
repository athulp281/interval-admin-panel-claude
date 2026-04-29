import ApiKeyTable from "@/components/api-keys/ApiKeyTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function ApiKeysPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="API Keys" />
      <ApiKeyTable />
    </div>
  );
}
