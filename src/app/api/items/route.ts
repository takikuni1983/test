import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const items = await prisma.itemMaster.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: '品目名は必須です' }, { status: 400 });
  try {
    const item = await prisma.itemMaster.create({ data: { name: name.trim() } });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'その品目名はすでに登録されています' }, { status: 409 });
  }
}
