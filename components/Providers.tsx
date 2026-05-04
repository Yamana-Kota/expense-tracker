'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * next-auth の SessionProvider をラップするクライアントコンポーネント
 *
 * App Router ではレイアウトがサーバーコンポーネントになるため、
 * `SessionProvider`（クライアントコンポーネント）を別ファイルに切り出す必要がある。
 * このコンポーネントを `app/layout.tsx` の body 内に配置することで、
 * アプリ全体で `useSession` によるセッション取得が可能になる。
 *
 * @param children - ラップするコンテンツ
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
