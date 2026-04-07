import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import DeleteButton from '@/components/ui/DeleteButton';
import MarkPaidButton from '@/components/invoices/MarkPaidButton';
import { Edit, Download } from 'lucide-react';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!invoice) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
          <StatusBadge status={invoice.status} type="invoice" />
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> PDF
          </a>
          {invoice.status !== 'PAID' && (
            <MarkPaidButton invoiceId={invoice.id} />
          )}
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" /> 編集
          </Link>
          <DeleteButton id={invoice.id} type="invoices" redirectTo="/invoices" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">請求先</p>
            <p className="font-semibold text-gray-900">{invoice.customer.companyName}</p>
            <p className="text-sm text-gray-600">{invoice.customer.contactName} 様</p>
            {invoice.customer.phone && <p className="text-sm text-gray-500">TEL: {invoice.customer.phone}</p>}
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">請求番号</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">発行日</span>
              <span>{formatDate(invoice.issueDate.toISOString())}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">支払期限</span>
                <span>{formatDate(invoice.dueDate.toISOString())}</span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">入金日</span>
                <span className="text-green-600 font-medium">{formatDate(invoice.paidAt.toISOString())}</span>
              </div>
            )}
          </div>
        </div>

        {invoice.subject && (
          <div>
            <p className="text-xs text-gray-500 mb-1">件名</p>
            <p className="font-medium">{invoice.subject}</p>
          </div>
        )}

        <div>
          <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-600">品目・内容</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600 w-16">数量</th>
                <th className="text-center px-3 py-2 font-medium text-gray-600 w-16">単位</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">単価</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">金額</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{item.unit}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-56 space-y-1 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">小計</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">消費税 ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-base">
                <span>合計</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.bankInfo && (
          <div>
            <p className="text-xs text-gray-500 mb-1">振込先</p>
            <p className="text-sm bg-blue-50 rounded p-3">{invoice.bankInfo}</p>
          </div>
        )}
        {invoice.notes && (
          <div>
            <p className="text-xs text-gray-500 mb-1">備考</p>
            <p className="text-sm bg-gray-50 rounded p-3">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <p className="text-xs text-gray-500 mb-1">取引条件</p>
            <p className="text-sm">{invoice.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
