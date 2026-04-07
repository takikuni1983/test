import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  const search = searchParams.get('search') ?? '';

  // Auto-mark overdue invoices
  await prisma.invoice.updateMany({
    where: { status: 'SENT', dueDate: { lt: new Date() } },
    data: { status: 'OVERDUE' },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(customerId ? { customerId: Number(customerId) } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search } },
              { subject: { contains: search } },
              { customer: { companyName: { contains: search } } },
            ],
          }
        : {}),
    },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerId, estimateId, status, issueDate, dueDate, subject, notes, terms, bankInfo, taxRate, lineItems } = body;

  if (!customerId || !issueDate) {
    return NextResponse.json({ error: '顧客と発行日は必須です' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const last = await tx.invoice.findFirst({ orderBy: { invoiceNumber: 'desc' } });
    const invoiceNumber = generateInvoiceNumber(last?.invoiceNumber ?? null);

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

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: Number(customerId),
        estimateId: estimateId ? Number(estimateId) : null,
        status: status ?? 'DRAFT',
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subject: subject ?? '',
        notes: notes ?? '',
        terms: terms ?? '',
        bankInfo: bankInfo ?? '',
        subtotal,
        taxRate: rate,
        taxAmount,
        totalAmount,
        lineItems: { create: items },
      },
      include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    });

    // If created from estimate, mark estimate as APPROVED
    if (estimateId) {
      await tx.estimate.update({ where: { id: Number(estimateId) }, data: { status: 'APPROVED' } });
    }

    return invoice;
  });

  return NextResponse.json(result, { status: 201 });
}
