// 'use client' がないのでサーバーコンポーネント。
// Header はインタラクティブな操作（state や onClick）を持たないため、
// サーバーコンポーネントのままでよい。JavaScript が少なくなり、表示が速い。

import Link from 'next/link';
import { LogOut, Receipt } from 'lucide-react';

/**
 * ダッシュボード全体の上部に表示されるヘッダーバー
 *
 * アプリ名（ロゴ）とログアウトボタンを含む。
 * `app/dashboard/layout.tsx` から使われ、すべてのダッシュボードページで共通表示される。
 */
export default function Header() {
  return (
    // <header> は HTML のセマンティックタグ。
    // <div> と見た目は同じだが、「ページのヘッダー領域」という意味を持つ。
    // スクリーンリーダーや検索エンジンがページ構造を理解しやすくなる（アクセシビリティ向上）。
    <header className="border-b border-gray-200 bg-white">
      {/* max-w-7xl で最大幅を制限し、mx-auto で水平中央揃え。
          px-4 sm:px-6 lg:px-8 でレスポンシブな左右パディング。 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* flex items-center justify-between で左右に要素を振り分ける。
            h-16 でヘッダーの高さを固定。 */}
        <div className="flex h-16 items-center justify-between">
          {/* アプリ名（ロゴ）。クリックするとダッシュボードトップへ戻る。
              Link の中に複数の子要素があっても問題ない。リンクエリア全体がクリック可能になる。 */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Receipt className="h-7 w-7 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Auto Expense
            </h1>
          </Link>

          {/* ログアウトボタン。実際にはトップページへのリンク（認証未実装のため）。
              hidden sm:inline は「スマホでは非表示、スマホ以上では表示」を意味する。
              アイコンはどのサイズでも表示し、テキストだけ小さい画面で隠すことで
              モバイルでもヘッダーがすっきり見える。 */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">ログアウト</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
