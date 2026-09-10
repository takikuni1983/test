'use client';

import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency, TAX_RATES } from '@/lib/utils';

export interface LineItemRow {
  description: string;
  details: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface Props {
  items: LineItemRow[];
  taxRate: number;
  onChange: (items: LineItemRow[]) => void;
  onTaxRateChange: (rate: number) => void;
  masterItems?: { id: number; name: string }[];
}

export default function LineItemsEditor({ items, taxRate, onChange, onTaxRateChange, masterItems = [] }: Props) {
  function updateItem(index: number, field: keyof LineItemRow, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        next.amount = Number(next.quantity) * Number(next.unitPrice);
      }
      return next;
    });
    onChange(updated);
  }

  function addItem() {
    onChange([...items, { description: '', details: '', quantity: 1, unit: '式', unitPrice: 0, amount: 0 }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-3">
      {/* 列ヘッダー */}
      <div className="grid grid-cols-[1fr_80px_64px_100px_100px_32px] gap-1 px-2 text-xs font-medium text-gray-500">
        <span>項目</span>
        <span className="text-right">数量</span>
        <span className="text-center">単位</span>
        <span className="text-right">単価</span>
        <span className="text-right">金額</span>
        <span />
      </div>

      {/* 明細行 */}
      <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
        {items.length === 0 && (
          <p className="text-center py-6 text-gray-400 text-sm">
            「行を追加」をクリックしてください
          </p>
        )}
        {items.map((item, i) => (
          <div key={i} className="px-2 py-2 space-y-1">
            {/* メイン行 */}
            <div className="grid grid-cols-[1fr_80px_64px_100px_100px_32px] gap-1 items-center">
              {/* 項目（datalist） */}
              <div>
                <input
                  list={`item-master-${i}`}
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  placeholder="項目名"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {masterItems.length > 0 && (
                  <datalist id={`item-master-${i}`}>
                    {masterItems.map((mi) => (
                      <option key={mi.id} value={mi.name} />
                    ))}
                  </datalist>
                )}
              </div>
              {/* 数量 */}
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {/* 単位 */}
              <input
                value={item.unit}
                onChange={(e) => updateItem(i, 'unit', e.target.value)}
                className="w-full text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {/* 単価 */}
              <input
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {/* 金額 */}
              <span className="text-right text-sm text-gray-700 px-1">
                {formatCurrency(item.amount)}
              </span>
              {/* 削除 */}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* 注釈 */}
            <textarea
              value={item.details}
              onChange={(e) => updateItem(i, 'details', e.target.value)}
              placeholder="注釈（任意）"
              rows={2}
              className="w-full border border-gray-100 rounded px-2 py-1 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none bg-gray-50"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" /> 行を追加
      </button>

      {/* 合計エリア */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-600">小計</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <div className="flex items-center gap-1 text-gray-600">
              消費税
              <select
                value={taxRate}
                onChange={(e) => onTaxRateChange(Number(e.target.value))}
                className="border border-gray-200 rounded text-xs px-1 py-0.5"
              >
                {TAX_RATES.map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold text-base">
            <span>合計</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
