// 'use client' がないのでサーバーコンポーネント。
// インタラクティブな操作（state, onClick）がないため、サーバーコンポーネントのままでよい。

import { Settings } from 'lucide-react';

/**
 * 設定タブのプレースホルダーコンポーネント
 *
 * 機能は未実装（Coming Soon）のため、案内テキストのみ表示する。
 */
export default function SettingsTab() {
  return (
    // flex flex-col items-center justify-center でコンテンツを縦横中央に配置する。
    // py-16 で上下に大きめのパディングを取り、コンテンツが中央に見えるようにする。
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-16 shadow-sm">
      {/* text-gray-300 で薄いグレーにして「未完成」の印象を与える。 */}
      <Settings className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 font-bold text-gray-700">設定</h3>
      <p className="text-sm font-medium text-gray-400">Coming Soon</p>
      <p className="mt-1 text-xs text-gray-300">この機能は近日公開予定です</p>
    </div>
  );
}
