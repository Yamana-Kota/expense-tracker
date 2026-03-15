// 'use client' がないので、このファイルはサーバーコンポーネント（デフォルト）。
// useState などは使えないが、初期 HTML をサーバーで生成するため表示が速い。

// Link は Next.js が提供するクライアントサイドナビゲーション用コンポーネント。
// 通常の <a> タグと違い、ページ全体を再読み込みせずに画面を切り替えられる（SPA的な動作）。
import Link from 'next/link';
import { Receipt, Camera, TrendingDown, Clock } from 'lucide-react';

/**
 * アプリのトップページ（ランディングページ）
 *
 * ユーザーが最初にアクセスする画面。アプリの説明と Google ログインボタンを表示する。
 *
 * @remarks
 * サーバーコンポーネントなので JavaScript バンドルに含まれず、
 * SEO や初期表示速度に優れる。
 */
export default function Home() {
  return (
    // bg-gradient-to-br は「右下方向へのグラデーション背景」を当てる Tailwind クラス。
    // from-blue-50 to-white で薄い青から白へグラデーションする。
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* mx-auto で水平中央揃え、max-w-6xl で最大幅を制限する。
          flex flex-col items-center justify-center で縦横中央に配置。
          px-4 sm:px-6 lg:px-8 はレスポンシブなパディング。
          sm: はスマホ以上、lg: はPC以上のときに適用されるクラス。 */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* ヘロセクション（ページの最初に見える大きなコンテンツ領域） */}
        <div className="text-center">
          {/* ロゴアイコン */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-blue-600 p-5 shadow-lg">
              {/* lucide-react のアイコンコンポーネント。h-12 w-12 でサイズを指定。
                  sm:h-16 sm:w-16 でスマホ以上のサイズでは少し大きく表示。 */}
              <Receipt className="h-12 w-12 text-white sm:h-16 sm:w-16" />
            </div>
          </div>

          {/* アプリ名 */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Auto Expense
          </h1>

          {/* キャッチコピー */}
          <p className="mb-12 text-xl text-gray-600 sm:text-2xl lg:text-3xl">
            レシートを撮るだけで
            {/* <br /> は HTML の改行タグ。JSX でもそのまま使える。 */}
            <br />
            かんたん家計簿
          </p>

          {/* 特徴カード3枚。
              grid gap-6 で CSS Grid レイアウト。
              sm:grid-cols-3 で「スマホ以上では3カラム」になる（デフォルトは1カラム）。 */}
          <div className="mb-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex justify-center">
                <Camera className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                撮影するだけ
              </h3>
              <p className="text-base text-gray-600">
                レシートを撮影するだけで自動で記録
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex justify-center">
                <TrendingDown className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                支出を見える化
              </h3>
              <p className="text-base text-gray-600">
                今月の支出が一目でわかる
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex justify-center">
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                時短で管理
              </h3>
              <p className="text-base text-gray-600">
                入力の手間なく続けられる
              </p>
            </div>
          </div>

          {/* ログインボタン。<a> タグではなく Next.js の Link コンポーネントを使う。
              href="/dashboard" でダッシュボードページへ遷移する。
              inline-flex items-center gap-3 でアイコンとテキストを横並びに揃える。
              active:scale-95 は「クリック中に少し縮む」アニメーション効果。 */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-10 py-5 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 sm:px-12 sm:text-xl"
          >
            {/* Google アイコンを SVG で直接埋め込んでいる。
                SVG（Scalable Vector Graphics）はベクター形式の画像フォーマット。
                どんなサイズに拡大・縮小してもぼやけない。
                viewBox で SVG の座標系を定義し、<path> で図形を描く。
                fill="currentColor" は「親要素の文字色（CSS の color）を使う」指定。 */}
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </Link>

          <p className="mt-6 text-sm text-gray-500">
            ログインすることで利用規約とプライバシーポリシーに同意したことになります
          </p>
        </div>
      </div>
    </div>
  );
}
