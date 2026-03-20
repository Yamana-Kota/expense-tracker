import { Settings } from 'lucide-react';

/**
 * 設定タブのプレースホルダーコンポーネント
 *
 * 機能は未実装（Coming Soon）のため、案内テキストのみ表示する。
 */
export default function SettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-16 shadow-sm">
      <Settings className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 font-bold text-gray-700">設定</h3>
      <p className="text-sm font-medium text-gray-400">Coming Soon</p>
      <p className="mt-1 text-xs text-gray-300">この機能は近日公開予定です</p>
    </div>
  );
}
