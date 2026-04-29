import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionList from "@/components/ecommerce/TransactionList";

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Transactions" />
      <TransactionList />
    </div>
  );
}
