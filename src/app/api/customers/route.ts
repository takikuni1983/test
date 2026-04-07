import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') ?? '';

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { companyName: { contains: search } },
            { contactName: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactName, email, phone, postalCode, prefecture, city, addressLine1, addressLine2, notes } = body;

  if (!companyName || !contactName) {
    return NextResponse.json({ error: '会社名と担当者名は必須です' }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: { companyName, contactName, email, phone, postalCode, prefecture, city, addressLine1, addressLine2, notes },
  });

  return NextResponse.json(customer, { status: 201 });
}
