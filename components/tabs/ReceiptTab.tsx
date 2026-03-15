'use client';

import { Camera } from 'lucide-react';

/**
 * レシート撮影・アップロードタブ
 *
 * 今月の支出サマリーとアップロードエリアを表示する。
 * 現在はモックデータ（固定値）を表示しており、実際のアップロード機能は未実装。
 *
 * @remarks
 * 将来的にはカメラ API やファイルアップロードを実装予定。
 */
export default function ReceiptTab() {
  return (
    // space-y-6 は子要素間の縦の余白を均等に設定する Tailwind クラス。
    <div className="space-y-6">
      {/* 今月サマリーカード。
          bg-gradient-to-br は右下方向へのグラデーション。
          from-blue-500 to-blue-600 で濃さが変わる青のグラデーション。 */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        {/* opacity-80 で文字の透明度を 80% にして少し薄くする。 */}
        <p className="mb-1 text-sm font-medium opacity-80">今月の支出</p>
        <p className="text-3xl font-bold">¥127,420</p>
      </div>

      {/* ドラッグ&ドロップ風のアップロードエリア。
          border-2 border-dashed で点線の枠線を表示。
          hover:border-blue-400 hover:bg-blue-50 でホバー時にスタイルが変わる。
          transition-colors でカラー変化をアニメーション化する。 */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          {/* rounded-full で完全な円形の背景。アイコンを中央に配置。 */}
          <div className="rounded-full bg-blue-100 p-5">
            <Camera className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              レシートを撮影またはアップロード
            </p>
            <p className="mt-1 text-sm text-gray-500">
              写真を撮るだけで自動で家計簿に記録されます
            </p>
          </div>
          {/* active:scale-95 は「ボタンを押した瞬間に 95% に縮む」効果。
              押した感触（フィードバック）をユーザーに与えるための UI パターン。 */}
          <button className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95">
            レシートを追加
          </button>
        </div>
      </div>
    </div>
  );
}
