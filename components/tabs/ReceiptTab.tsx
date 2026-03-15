'use client';

import { Camera } from 'lucide-react';

export default function ReceiptTab() {
  return (
    <div className="space-y-6">
      {/* 今月サマリー */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <p className="mb-1 text-sm font-medium opacity-80">今月の支出</p>
        <p className="text-3xl font-bold">¥127,420</p>
      </div>

      {/* アップロードエリア */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
        <div className="flex flex-col items-center gap-4">
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
          <button className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95">
            レシートを追加
          </button>
        </div>
      </div>
    </div>
  );
}
