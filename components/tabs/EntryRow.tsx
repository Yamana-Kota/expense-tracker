'use client';

import { useCallback } from 'react';
import { Loader2, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import type { Entry } from '@/shared/entry';

type EntryRowProps = {
  entry: Entry;
  onDelete: (id: string) => void;
  isPending?: boolean | undefined;
};

/**
 * 収支エントリの1行コンポーネント
 *
 * カテゴリ・メモ・金額を横並びで表示し、削除ボタンを提供する。
 * DayCell と同様に、onDelete を useCallback でメモ化して親から受け取る設計にしている。
 * isPending が true のときはサーバー保存中としてスピナーを表示し、削除ボタンを非表示にする。
 *
 * @param entry - 表示するエントリオブジェクト
 * @param onDelete - 削除ボタン押下時に呼ばれるコールバック（引数: entry.id）
 * @param isPending - サーバーへの保存が完了していない楽観的エントリかどうか
 */
function EntryRow({ entry, onDelete, isPending = false }: EntryRowProps) {
  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [entry.id, onDelete]);

  return (
    <div
      className={`flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        {entry.type === 'expense' ? (
          <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-400" />
        ) : (
          <TrendingUp className="h-4 w-4 flex-shrink-0 text-green-500" />
        )}
        <div>
          <span className="text-sm font-semibold text-gray-900">
            {entry.category}
          </span>
          {entry.note && (
            <span className="ml-2 text-xs text-gray-400">{entry.note}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold ${
            entry.type === 'expense' ? 'text-red-500' : 'text-green-600'
          }`}
        >
          {entry.type === 'expense' ? '-' : '+'}¥{entry.amount.toLocaleString()}
        </span>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
        ) : (
          <button
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
            aria-label="削除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default EntryRow;
