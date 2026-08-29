import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import DeleteButton from '@/components/ui/DeleteButton';
import ConvertToInvoiceButton from '@/components/estimates/ConvertToInvoiceButton';
import { Edit, Download } from 'lucide-react';

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({
    where: { id: Number(id) },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!estimate) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      {/* アクションバー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">{estimate.estimateNumber}</h2>
          <StatusBadge status={estimate.status} type="estimate" />
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/estimates/${estimate.id}/pdf`}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> PDF
          </a>
          {estimate.status !== 'INVOICED' && (
            <ConvertToInvoiceButton estimateId={estimate.id} />
          )}
          <Link
            href={`/estimates/${estimate.id}/edit`}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" /> 編集
          </Link>
          <DeleteButton id={estimate.id} type="estimates" redirectTo="/estimates" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* ヘッダー情報 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">お見積先</p>
            <p className="font-semibold text-gray-900">{estimate.customer.companyName}</p>
            <p className="text-sm text-gray-600">{estimate.customer.contactName} 様</p>
            {estimate.customer.phone && <p className="text-sm text-gray-500">TEL: {estimate.customer.phone}</p>}
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">見積番号</span>
              <span className="font-medium">{estimate.estimateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">発行日</span>
              <span>{formatDate(estimate.issueDate.toISOString())}</span>
            </div>
            {estimate.expiryDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">有効期限</span>
                <span>{formatDate(estimate.expiryDate.toISOString())}</span>
              </div>
            )}
          </div>
        </div>

        {estimate.subject && (
          <div>
            <p className="text-xs text-gray-500 mb-1">件名</p>
            <p className="font-medium">{estimate.subject}</p>
          </div>
        )}
        {(estimate as any).projectName && (
          <div>
            <p className="text-xs text-gray-500 mb-1">案件名</p>
            <p className="font-medium">{(estimate as any).projectName}</p>
          </div>
        )}

        {/* 明細テーブル */}
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
              {estimate.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">
                    <div>{item.description}</div>
                    {(item as any).details && (
                      <div className="text-xs text-gray-400 mt-0.5">{(item as any).details}</div>
                    )}
                  </td>
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
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">消費税 ({estimate.taxRate}%)</span>
                <span>{formatCurrency(estimate.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-base">
                <span>合計</span>
                <span>{formatCurrency(estimate.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {estimate.notes && (
          <div>
            <p className="text-xs text-gray-500 mb-1">備考</p>
            <p className="text-sm bg-gray-50 rounded p-3">{estimate.notes}</p>
          </div>
        )}
        {estimate.terms && (
          <div>
            <p className="text-xs text-gray-500 mb-1">取引条件</p>
            <p className="text-sm">{estimate.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
