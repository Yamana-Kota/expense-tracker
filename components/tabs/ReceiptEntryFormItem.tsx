'use client';

import { useCallback } from 'react';
import type { EntryType } from '@/shared/entry';

const EXPENSE_CATEGORIES = [
  '食費',
  '外食',
  '交通費',
  '娯楽',
  '日用品',
  '医療',
  '衣服',
  'その他',
] as const;

const INCOME_CATEGORIES = [
  '給与',
  '副業',
  'ボーナス',
  '贈り物',
  'その他',
] as const;

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export type FormEntry = {
  date: string;
  type: EntryType;
  category: string;
  amount: string;
  note: string;
};

type Props = {
  entry: FormEntry;
  index: number;
  onChange: (index: number, updates: Partial<FormEntry>) => void;
};

/**
 * カンマ区切りの金額文字列を数値に変換する
 *
 * @param formatted - カンマ区切りの金額文字列
 * @returns 数値
 */
export function parseAmountInput(formatted: string): number {
  return Number(formatted.replace(/,/g, ''));
}

/**
 * レシート解析結果の1件分の編集フォーム
 *
 * カテゴリごとに分割された収支情報を表示・編集する。
 * 変更時は親コンポーネントの onChange コールバックを通じて通知する。
 *
 * @param entry - フォームの初期値となる収支情報
 * @param index - 一覧内のインデックス（表示番号と onChange の識別に使用）
 * @param onChange - フィールド変更時のコールバック
 */
export default function ReceiptEntryFormItem({ entry, index, onChange }: Props) {
  const handleSelectExpense = useCallback(() => {
    onChange(index, { type: 'expense', category: EXPENSE_CATEGORIES[0] });
  }, [index, onChange]);

  const handleSelectIncome = useCallback(() => {
    onChange(index, { type: 'income', category: INCOME_CATEGORIES[0] });
  }, [index, onChange]);

  const handleDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, { date: event.target.value });
    },
    [index, onChange],
  );

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(index, { category: event.target.value });
    },
    [index, onChange],
  );

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, { amount: formatAmountInput(event.target.value) });
    },
    [index, onChange],
  );

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, { note: event.target.value });
    },
    [index, onChange],
  );

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-semibold text-gray-500">項目 {index + 1}</p>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={handleSelectExpense}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${entry.type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          支出
        </button>
        <button
          type="button"
          onClick={handleSelectIncome}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${entry.type === 'income' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          収入
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">日付</label>
          <input type="date" value={entry.date} onChange={handleDateChange} className={INPUT_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">カテゴリ</label>
          <select value={entry.category} onChange={handleCategoryChange} className={INPUT_CLASS}>
            {(entry.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">金額（円）</label>
          <input
            type="text"
            inputMode="numeric"
            value={entry.amount}
            onChange={handleAmountChange}
            placeholder="0"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">メモ（任意）</label>
          <input
            type="text"
            value={entry.note}
            onChange={handleNoteChange}
            placeholder="例：コンビニ、スーパーなど"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// Helpers
// ----------------------------------------

function formatAmountInput(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
}
