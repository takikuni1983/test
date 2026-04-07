import { cn, ESTIMATE_STATUS_LABELS, ESTIMATE_STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/utils';

interface Props {
  status: string;
  type: 'estimate' | 'invoice';
}

export default function StatusBadge({ status, type }: Props) {
  const labels = type === 'estimate' ? ESTIMATE_STATUS_LABELS : INVOICE_STATUS_LABELS;
  const colors = type === 'estimate' ? ESTIMATE_STATUS_COLORS : INVOICE_STATUS_COLORS;

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[status])}>
      {labels[status] ?? status}
    </span>
  );
}
