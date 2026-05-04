import { Receipt, Camera, TrendingDown, Clock } from 'lucide-react';
import SignInButton from '@/components/SignInButton';

/**
 * アプリのトップページ（ランディングページ）
 *
 * ユーザーが最初にアクセスする画面。アプリの説明と Cognito ログインボタンを表示する。
 *
 * @remarks
 * サーバーコンポーネントなので JavaScript バンドルに含まれず、
 * SEO や初期表示速度に優れる。
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-blue-600 p-5 shadow-lg">
              <Receipt className="h-12 w-12 text-white sm:h-16 sm:w-16" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Auto Expense
          </h1>

          <p className="mb-12 text-xl text-gray-600 sm:text-2xl lg:text-3xl">
            レシートを撮るだけで
            <br />
            かんたん家計簿
          </p>

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

          <SignInButton />

        </div>
      </div>
    </div>
  );
}
