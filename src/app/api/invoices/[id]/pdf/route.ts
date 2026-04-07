import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf/invoice-template';
import React from 'react';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!invoice) return NextResponse.json({ error: '請求書が見つかりません' }, { status: 404 });

  const buffer = await renderToBuffer(React.createElement(InvoicePDF, { invoice: invoice as any }));

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
