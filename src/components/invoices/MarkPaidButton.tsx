'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function MarkPaidButton({ invoiceId }: { invoiceId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkPaid() {
    if (!confirm('入金済みとしてマークしますか？')) return;
    setLoading(true);
    try {
      // Fetch current invoice
      const res = await fetch(`/api/invoices/${invoiceId}`);
      const invoice = await res.json();

      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoice,
          status: 'PAID',
          paidAt: new Date().toISOString(),
          issueDate: invoice.issueDate.slice(0, 10),
          dueDate: invoice.dueDate?.slice(0, 10),
          lineItems: invoice.lineItems,
        }),
      });

      router.refresh();
    } catch {
      alert('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkPaid}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
    >
      <CheckCircle className="h-4 w-4" />
      {loading ? '処理中...' : '入金済みにする'}
    </button>
  );
}
