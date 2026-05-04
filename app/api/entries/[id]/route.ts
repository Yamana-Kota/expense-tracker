import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * 収支エントリを削除する
 *
 * 認証ユーザーが所有するエントリのみ削除可能。
 * 存在しない場合は 404、他ユーザーのエントリの場合は 403 を返す。
 *
 * @param _request - リクエストオブジェクト（未使用）
 * @param params - ルートパラメータ（id を含む）
 * @returns 204 No Content
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.entry.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (record.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.entry.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
