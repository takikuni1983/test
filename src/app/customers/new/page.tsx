import CustomerForm from '@/components/customers/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">顧客を新規登録</h2>
      <CustomerForm />
    </div>
  );
}
