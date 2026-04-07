import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!invoice) return NextResponse.json({ error: '請求書が見つかりません' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { customerId, status, issueDate, dueDate, subject, notes, terms, bankInfo, taxRate, lineItems, paidAt } = body;

  const result = await prisma.$transaction(async (tx) => {
    await tx.invoiceLineItem.deleteMany({ where: { invoiceId: Number(id) } });

    const items = (lineItems ?? []).map((item: any, i: number) => ({
      sortOrder: i,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit ?? '',
      unitPrice: Number(item.unitPrice),
      amount: Number(item.quantity) * Number(item.unitPrice),
    }));

    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const rate = Number(taxRate ?? 10);
    const taxAmount = Math.round(subtotal * rate / 100);
    const totalAmount = subtotal + taxAmount;

    return tx.invoice.update({
      where: { id: Number(id) },
      data: {
        customerId: Number(customerId),
        status,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subject,
        notes,
        terms,
        bankInfo,
        subtotal,
        taxRate: rate,
        taxAmount,
        totalAmount,
        paidAt: paidAt ? new Date(paidAt) : null,
        lineItems: { create: items },
      },
      include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
  });

  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.invoice.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
