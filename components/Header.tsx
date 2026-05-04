'use client';

import Link from 'next/link';
import { LogIn, LogOut, Receipt } from 'lucide-react';
import { useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

/**
 * ダッシュボード全体の上部に表示されるヘッダーバー
 *
 * アプリ名（ロゴ）と、セッション状態に応じた認証ボタンを含む。
 * `app/dashboard/layout.tsx` から使われ、すべてのダッシュボードページで共通表示される。
 */
export default function Header() {
  const { status } = useSession();

  const handleSignIn = useCallback(() => {
    void signIn('cognito', { callbackUrl: '/dashboard' });
  }, []);

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: '/' });
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Receipt className="h-7 w-7 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Auto Expense
            </h1>
          </Link>

          {status === 'authenticated' && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          )}

          {status === 'unauthenticated' && (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <LogIn className="h-5 w-5" />
              <span className="hidden sm:inline">ログイン</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
