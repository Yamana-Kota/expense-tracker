'use client';

import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';
import DayCell from '@/components/tabs/DayCell';

type EntryType = 'expense' | 'income';

type Entry = {
  id: number;
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  note: string;
};

const initialEntries: Entry[] = [
  {
    id: 1,
    date: '2026-03-05',
    type: 'expense',
    category: '食費',
    amount: 3200,
    note: 'スーパー',
  },
  {
    id: 2,
    date: '2026-03-10',
    type: 'income',
    category: '給与',
    amount: 250000,
    note: '3月分給与',
  },
  {
    id: 3,
    date: '2026-03-15',
    type: 'expense',
    category: '交通費',
    amount: 1500,
    note: '電車代',
  },
  {
    id: 4,
    date: '2026-03-20',
    type: 'expense',
    category: '外食',
    amount: 4800,
    note: 'ランチ',
  },
  {
    id: 5,
    date: '2026-03-08',
    type: 'expense',
    category: '日用品',
    amount: 2100,
    note: 'ドラッグストア',
  },
];

const EXPENSE_CATEGORIES = [
  '食費',
  '外食',
  '交通費',
  '娯楽',
  '日用品',
  '医療',
  '衣服',
  'その他',
];
const INCOME_CATEGORIES = ['給与', '副業', 'ボーナス', '贈り物', 'その他'];
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 年・月・日を 'YYYY-MM-DD' 形式の文字列に変換する
 *
 * @param year - 年
 * @param month - 月（0始まり。0=1月, 11=12月）
 * @param day - 日
 * @returns 'YYYY-MM-DD' 形式の日付文字列
 */
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * 指定した日付文字列に一致するエントリ一覧を返す
 *
 * @param entries - 全エントリの配列
 * @param dateStr - 絞り込む日付文字列（'YYYY-MM-DD' 形式）
 * @returns 指定日に一致するエントリの配列
 */
function getEntriesForDate(entries: Entry[], dateStr: string) {
  return entries.filter((entry) => entry.date === dateStr);
}

/**
 * 指定日の支出合計と収入合計を計算して返す
 *
 * @param entries - 全エントリの配列
 * @param year - 年
 * @param month - 月（0始まり）
 * @param day - 日
 * @returns 支出合計と収入合計を持つオブジェクト
 */
function getDayTotals(
  entries: Entry[],
  year: number,
  month: number,
  day: number,
) {
  const dayEntries = getEntriesForDate(entries, toDateStr(year, month, day));
  return {
    expense: dayEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0),
    income: dayEntries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0),
  };
}

/**
 * フォームの入力値からエントリオブジェクトを生成する
 *
 * @param selectedDate - 選択中の日付文字列（'YYYY-MM-DD' 形式）
 * @param amount - 金額の文字列（空文字のとき null を返す）
 * @param entryType - 収支の種別
 * @param category - カテゴリ名
 * @param note - メモ
 * @returns 生成した Entry、または amount が空のとき null
 */
function buildEntry(
  selectedDate: string,
  amount: string,
  entryType: EntryType,
  category: string,
  note: string,
): Entry | null {
  if (!amount) return null;
  return {
    id: Date.now(),
    date: selectedDate,
    type: entryType,
    category,
    amount: Number(amount),
    note,
  };
}

/**
 * 収支種別に対応するデフォルトカテゴリを返す
 *
 * @param type - 収支の種別
 * @returns カテゴリリストの先頭の文字列
 */
function resolveDefaultCategory(type: EntryType): string {
  return type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
}

/**
 * 手動登録タブコンポーネント
 *
 * カレンダー形式で日付を選択し、収支エントリを追加・一覧表示する。
 * 月移動・日付選択・フォーム表示・エントリ保存の state を管理する。
 */
export default function ManualEntryTab() {
  const today = new Date();
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selectedEntries = selectedDate
    ? getEntriesForDate(entries, selectedDate)
    : [];

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
    );
  }, []);

  const handleDaySelect = useCallback(
    (dateStr: string, isSelected: boolean) => {
      setSelectedDate(isSelected ? null : dateStr);
      setShowForm(false);
    },
    [],
  );

  const handleShowAddForm = useCallback(() => {
    setShowForm(true);
    setEntryType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    setAmount('');
    setNote('');
  }, []);

  const handleHideForm = useCallback(() => setShowForm(false), []);

  const handleSelectExpense = useCallback(() => {
    setEntryType('expense');
    setCategory(resolveDefaultCategory('expense'));
  }, []);

  const handleSelectIncome = useCallback(() => {
    setEntryType('income');
    setCategory(resolveDefaultCategory('income'));
  }, []);

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCategory(event.target.value);
    },
    [],
  );

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(event.target.value);
    },
    [],
  );

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNote(event.target.value);
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!selectedDate) return;
    const entry = buildEntry(selectedDate, amount, entryType, category, note);
    if (!entry) return;

    setEntries((previous) => [...previous, entry]);
    setAmount('');
    setNote('');
    setShowForm(false);
  }, [selectedDate, amount, entryType, category, note]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {year}年{month + 1}月
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={`py-1.5 text-xs font-semibold ${
                index === 0
                  ? 'text-red-400'
                  : index === 6
                    ? 'text-blue-400'
                    : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = toDateStr(year, month, day);
            const { expense, income } = getDayTotals(entries, year, month, day);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const dayOfWeek = (firstDayOfWeek + index) % 7;

            return (
              <DayCell
                key={day}
                day={day}
                dateStr={dateStr}
                expense={expense}
                income={income}
                isSelected={isSelected}
                isToday={isToday}
                dayOfWeek={dayOfWeek}
                onSelect={handleDaySelect}
              />
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                'ja-JP',
                {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                },
              )}
            </h3>
            <button
              onClick={handleShowAddForm}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              追加
            </button>
          </div>

          {selectedEntries.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
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
                        <span className="ml-2 text-xs text-gray-400">
                          {entry.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      entry.type === 'expense'
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}
                  >
                    {entry.type === 'expense' ? '-' : '+'}¥
                    {entry.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedEntries.length === 0 && !showForm && (
            <p className="py-4 text-center text-sm text-gray-400">
              この日の記録はありません
            </p>
          )}

          {showForm && (
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">新しい記録</h4>
                <button
                  onClick={handleHideForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  onClick={handleSelectExpense}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    entryType === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  支出
                </button>
                <button
                  onClick={handleSelectIncome}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    entryType === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  収入
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    カテゴリ
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {(entryType === 'expense'
                      ? EXPENSE_CATEGORIES
                      : INCOME_CATEGORIES
                    ).map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    金額（円）
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    メモ（任意）
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={handleNoteChange}
                    placeholder="例：コンビニ、スーパーなど"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleHideForm}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={!amount}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
