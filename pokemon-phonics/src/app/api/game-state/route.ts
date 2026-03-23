import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const KEY = 'pokemon-phonics:gamestate';

export async function GET() {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }

  const data = await redis.get(KEY);
  if (!data) {
    return NextResponse.json(null);
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }

  const body = await req.json();
  await redis.set(KEY, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }

  await redis.del(KEY);
  return NextResponse.json({ ok: true });
}
