import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateEstimateNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  const search = searchParams.get('search') ?? '';

  const estimates = await prisma.estimate.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(customerId ? { customerId: Number(customerId) } : {}),
      ...(search
        ? {
            OR: [
              { estimateNumber: { contains: search } },
              { subject: { contains: search } },
              { customer: { companyName: { contains: search } } },
            ],
          }
        : {}),
    },
    include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(estimates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerId, status, issueDate, expiryDate, subject, notes, terms, taxRate, lineItems } = body;

  if (!customerId || !issueDate) {
    return NextResponse.json({ error: '顧客と発行日は必須です' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const last = await tx.estimate.findFirst({ orderBy: { estimateNumber: 'desc' } });
    const estimateNumber = generateEstimateNumber(last?.estimateNumber ?? null);

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

    return tx.estimate.create({
      data: {
        estimateNumber,
        customerId: Number(customerId),
        status: status ?? 'DRAFT',
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        subject: subject ?? '',
        notes: notes ?? '',
        terms: terms ?? '',
        subtotal,
        taxRate: rate,
        taxAmount,
        totalAmount,
        lineItems: { create: items },
      },
      include: { customer: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
  });

  return NextResponse.json(result, { status: 201 });
}
