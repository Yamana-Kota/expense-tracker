'use client';

import { useCallback } from 'react';
import { TrendingDown, TrendingUp, Trash2 } from 'lucide-react';

type EntryType = 'expense' | 'income';

type Entry = {
  id: number;
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  note: string;
};

type EntryRowProps = {
  entry: Entry;
  onDelete: (id: number) => void;
};

/**
 * 収支エントリの1行コンポーネント
 *
 * カテゴリ・メモ・金額を横並びで表示し、削除ボタンを提供する。
 * DayCell と同様に、onDelete を useCallback でメモ化して親から受け取る設計にしている。
 *
 * @param entry - 表示するエントリオブジェクト
 * @param onDelete - 削除ボタン押下時に呼ばれるコールバック（引数: entry.id）
 */
function EntryRow({ entry, onDelete }: EntryRowProps) {
  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [entry.id, onDelete]);

  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
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
        <button
          onClick={handleDelete}
          className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
          aria-label="削除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default EntryRow;
