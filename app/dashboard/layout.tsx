// 'use client' がないので、このファイルはサーバーコンポーネント（デフォルト）。
// サーバー側でレンダリングされ、JavaScript を含まない HTML を生成するため
// 初期表示が高速になる。useState などのブラウザ専用 API は使えない。

import Header from '@/components/Header';

/**
 * ダッシュボード配下のページ全体を包むレイアウト
 *
 * Next.js App Router では `app/dashboard/layout.tsx` が
 * `app/layout.tsx`（ルートレイアウト）の内側にネストされる。
 * `app/dashboard/` 配下のすべてのページに自動的に適用される。
 *
 * レイアウトの入れ子構造:
 * ```
 * RootLayout（app/layout.tsx）
 *   └─ DashboardLayout（app/dashboard/layout.tsx）
 *        └─ 各ページ（例: app/dashboard/page.tsx）
 * ```
 *
 * @param children - ダッシュボード配下の各ページの内容
 *
 * @remarks
 * レイアウトコンポーネントは「ページをまたいで共通の UI を提供する」役割を持つ。
 * ページ遷移しても Header などのレイアウト部分は再マウントされず、
 * DOM が保持されるためパフォーマンスが良い。
 */
export default function DashboardLayout({
  // 引数をオブジェクトの分割代入で受け取る。
  // children の型は `React.ReactNode`（React が描画できるもの全般）。
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // min-h-screen で画面の高さ以上になるように設定し、
    // bg-gray-50 でページ背景をごく薄いグレーにする。
    <div className="min-h-screen bg-gray-50">
      {/* Header はすべてのダッシュボードページで共通表示される。
          ページが切り替わっても再マウントされない（レイアウトの利点）。 */}
      <Header />

      {/* main 要素はページのメインコンテンツを示すセマンティックな HTML タグ。
          アクセシビリティツール（スクリーンリーダーなど）が
          メインコンテンツを識別するために使う。 */}
      <main>{children}</main>
    </div>
  );
}
