import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Entry, EntryType } from '@/shared/entry';

/**
 * Prisma のレコードを API レスポンス用の Entry 型に変換する
 *
 * @param record - Prisma から取得したレコード
 * @returns フロントエンド用の Entry オブジェクト
 */
function toEntry(record: {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  note: string | null;
}): Entry {
  return {
    id: record.id,
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Date の ISO 文字列変換
    date: record.date.toISOString().split('T')[0] as string,
    type: record.type as EntryType,
    category: record.category,
    amount: record.amount,
    note: record.note ?? undefined,
  };
}

/**
 * 収支エントリ一覧を取得する
 *
 * クエリパラメータ `year` と `month` で月絞り込みが可能。
 * 未指定の場合は認証ユーザーの全エントリを返す。
 *
 * @param request - リクエストオブジェクト
 * @returns Entry 配列の JSON レスポンス
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  let dateFilter: { gte: Date; lte: Date } | undefined;
  if (year && month) {
    const y = Number(year);
    const m = Number(month);
    dateFilter = {
      gte: new Date(y, m - 1, 1),
      lte: new Date(y, m, 0, 23, 59, 59, 999),
    };
  }

  const records = await prisma.entry.findMany({
    where: {
      userId: session.user.id,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(records.map(toEntry));
}

/**
 * 収支エントリを新規作成する
 *
 * @param request - リクエストボディに date, type, category, amount, note を含む
 * @returns 作成した Entry の JSON レスポンス（201）
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    date?: unknown;
    type?: unknown;
    category?: unknown;
    amount?: unknown;
    note?: unknown;
  };

  const { date, type, category, amount, note } = body;

  if (
    typeof date !== 'string' ||
    typeof type !== 'string' ||
    typeof category !== 'string' ||
    typeof amount !== 'number'
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (type !== 'expense' && type !== 'income') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  if (amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const record = await prisma.entry.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      type,
      category,
      amount,
      note: typeof note === 'string' && note.length > 0 ? note : null,
    },
  });

  return NextResponse.json(toEntry(record), { status: 201 });
}
