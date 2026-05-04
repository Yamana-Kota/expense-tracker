import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * 未認証ユーザーを /dashboard 配下からトップページへリダイレクトするミドルウェア
 *
 * next-auth v5 の `auth` 関数をミドルウェアとして利用する。
 * セッションが存在しない場合にのみリダイレクトを行う。
 *
 * @param request - next-auth が拡張した NextRequest（`request.auth` でセッション取得可能）
 * @returns セッションがある場合はそのまま通過、ない場合はトップページへリダイレクト
 */
export default auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL('/', request.url));
  }
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
