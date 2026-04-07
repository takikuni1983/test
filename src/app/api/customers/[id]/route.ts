import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id: Number(id) } });
  if (!customer) return NextResponse.json({ error: '顧客が見つかりません' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { companyName, contactName, email, phone, postalCode, prefecture, city, addressLine1, addressLine2, notes } = body;

  if (!companyName || !contactName) {
    return NextResponse.json({ error: '会社名と担当者名は必須です' }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: { companyName, contactName, email, phone, postalCode, prefecture, city, addressLine1, addressLine2, notes },
  });

  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
