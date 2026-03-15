// `import type` は型だけをインポートする TypeScript の構文。
// 実行時には型情報は消えるため、型だけが必要なものは `import type` にすると
// バンドルサイズの最適化やツールの誤検知防止になる。
import type { Metadata } from 'next';

// next/font/google はフォントファイルをビルド時に最適化してホストするモジュール。
// Google Fonts から直接読み込むのではなく、自前サーバーから配信するため高速。
import { Geist, Geist_Mono } from 'next/font/google';

// グローバルな CSS ファイルをインポート。
// App Router ではルートレイアウトにのみ globals.css をインポートする。
import './globals.css';

// Geist() を呼び出してフォントを設定する。
// variable オプションで CSS カスタムプロパティ（変数）名を指定する。
// 例: '--font-geist-sans' という変数に Geist フォントが割り当てられる。
// subsets で使用する文字セットを指定することでフォントファイルを最小化できる。
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// `export const metadata` は Next.js App Router の特別な名前付きエクスポート。
// この変数に Metadata 型のオブジェクトを代入すると、Next.js が自動的に
// <head> 内の <title> や <meta> タグを生成してくれる。
// Metadata 型で補完が効き、不正なプロパティを書くとコンパイルエラーになる。
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
    // html 要素に lang 属性でページの言語を指定する（アクセシビリティ・SEO に重要）。
    <html lang="ja">
      <body
        // テンプレートリテラルで複数のクラス名を結合する。
        // geistSans.variable は '--font-geist-sans' という CSS 変数を有効にするクラス名を返す。
        // antialiased は Tailwind のクラスで、フォントのギザギザを滑らかにする CSS を適用する。
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* children はこのレイアウトにネストされたページやレイアウトが入る。
            React がルーティングに応じて適切な内容を注入する。 */}
        {children}
      </body>
    </html>
  );
}
