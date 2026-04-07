import CustomerForm from '@/components/customers/CustomerForm';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id: Number(id) } });
  if (!customer) notFound();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">顧客を編集</h2>
      <CustomerForm customer={customer as any} />
    </div>
  );
}
