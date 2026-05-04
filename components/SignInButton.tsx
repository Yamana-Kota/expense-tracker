'use client';

import { useCallback } from 'react';
import { signIn } from 'next-auth/react';

/**
 * Cognito プロバイダーへのサインインをトリガーするボタン
 *
 * サーバーコンポーネントである `app/page.tsx` から使用するために
 * クライアントコンポーネントとして分離している。
 * クリック時に `signIn('cognito')` を呼び出し、Cognito の認証フローへ遷移する。
 */
export default function SignInButton() {
  const handleSignIn = useCallback(() => {
    void signIn('cognito', { callbackUrl: '/dashboard' });
  }, []);

  return (
    <button
      onClick={handleSignIn}
      className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-10 py-5 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 sm:px-12 sm:text-xl"
    >
      ログイン
    </button>
  );
}
