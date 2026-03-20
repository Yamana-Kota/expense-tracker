import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Auto Expense',
  description: 'レシートを撮るだけでかんたん家計簿',
};

/**
 * アプリケーション全体を包むルートレイアウト
 *
 * Next.js App Router では `app/layout.tsx` が最上位のレイアウトとなり、
 * すべてのページが children としてこのコンポーネントにネストされる。
 * HTML の骨格（`<html>`, `<body>`）はここにしか書かない。
 *
 * @param children - 各ページやネストされたレイアウトの内容
 *
 * @remarks
 * - `Readonly<{...}>` は props オブジェクトを読み取り専用にする TypeScript のユーティリティ型。
 *   これにより、誤って props を書き換えようとするとコンパイルエラーになる。
 * - `React.ReactNode` は「React が描画できるもの全般」を表す型。
 *   JSX 要素・文字列・数値・配列・null・undefined などを含む。
 * - `lang="ja"` を指定することでスクリーンリーダーや検索エンジンが
 *   ページの言語を正しく認識できる。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
