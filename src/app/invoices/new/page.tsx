import { prisma } from '@/lib/db';
import InvoiceForm from '@/components/invoices/InvoiceForm';

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const customers = await prisma.customer.findMany({ orderBy: { companyName: 'asc' } });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">請求書を新規作成</h2>
      <InvoiceForm
        customers={customers as any}
        defaultCustomerId={customerId ? Number(customerId) : undefined}
      />
    </div>
  );
}
