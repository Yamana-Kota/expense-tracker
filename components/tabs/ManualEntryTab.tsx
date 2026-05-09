'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import DayCell from '@/components/tabs/DayCell';
import EntryRow from '@/components/tabs/EntryRow';
import type { Entry, EntryType } from '@/shared/entry';

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
 * 入力文字列から数字のみ取り出し、カンマ区切りにフォーマットする
 *
 * @param value - ユーザーの入力文字列
 * @returns カンマ区切りの金額文字列（例: "10,000"）、数字がなければ空文字
 */
function formatAmountInput(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString();
}

/**
 * カンマ区切りの金額文字列を数値に変換する
 *
 * @param formatted - カンマ区切りの金額文字列
 * @returns 数値
 */
function parseAmountInput(formatted: string): number {
  return Number(formatted.replace(/,/g, ''));
}

/**
 * サマリーカード用に金額を整形する
 *
 * 3桁区切りのカンマ付き数字に「円」を付けて返す。
 *
 * @param amount - 表示する金額（円）
 * @returns フォーマット済みの金額文字列
 */
function formatSummaryAmount(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

/**
 * 指定した年月のエントリから支出合計と収入合計を計算する
 *
 * @param entries - 全エントリの配列
 * @param year - 年
 * @param month - 月（0始まり）
 * @returns 支出合計と収入合計を持つオブジェクト
 */
function getMonthlyTotals(
  entries: ReadonlyArray<Entry>,
  year: number,
  month: number,
): { expense: number; income: number } {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEntries = entries.filter((entry) => entry.date.startsWith(prefix));
  // 各値の合計を計算する
  return {
    expense: monthEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0),
    income: monthEntries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0),
  };
}

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
function getEntriesForDate(entries: ReadonlyArray<Entry>, dateStr: string) {
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
  entries: ReadonlyArray<Entry>,
  year: number,
  month: number,
  day: number,
) {
  const dayEntries = getEntriesForDate(entries, toDateStr(year, month, day));
  // 各値の合計を計算する
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
 * エントリの取得・作成・削除は API を通じて行う。
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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const entriesCache = useRef<Map<string, ReadonlyArray<Entry>>>(new Map());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const maxMonth = new Date(today.getFullYear() + 1, today.getMonth() - 1, 1);
  const isMaxMonth =
    year === maxMonth.getFullYear() && month === maxMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selectedEntries = selectedDate
    ? getEntriesForDate(entries, selectedDate)
    : [];

  const { expense: monthlyExpense, income: monthlyIncome } = getMonthlyTotals(
    entries,
    year,
    month,
  );
  const monthlyBalance = monthlyIncome - monthlyExpense;

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `${year}-${month}`;

    const fetchEntries = async () => {
      const cached = entriesCache.current.get(cacheKey);
      if (cached) {
        setEntries([...cached]);
        setIsLoadingEntries(false);
      } else {
        setIsLoadingEntries(true);
      }

      try {
        const response = await fetch(
          `/api/entries?year=${year}&month=${month + 1}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as Entry[];
        entriesCache.current.set(cacheKey, data);
        setEntries(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingEntries(false);
        }
      }
    };

    void fetchEntries();
    return () => controller.abort();
  }, [year, month]);

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
      setAmount(formatAmountInput(event.target.value));
    },
    [],
  );

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNote(event.target.value);
    },
    [],
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (!response.ok) return;
      const cacheKey = `${year}-${month}`;
      setEntries((previous) => {
        const updated = previous.filter((entry) => entry.id !== id);
        entriesCache.current.set(cacheKey, updated);
        return updated;
      });
    },
    [year, month],
  );

  const handleSave = useCallback(async () => {
    const numericAmount = parseAmountInput(amount);
    if (!selectedDate || !amount || numericAmount <= 0) return;

    const optimisticId = `optimistic-${Math.random().toString(36).slice(2)}`;
    const optimisticEntry: Entry = {
      id: optimisticId,
      date: selectedDate,
      type: entryType,
      category,
      amount: numericAmount,
      note: note || undefined,
    };

    // 楽観的更新: フォームを即座に閉じてエントリをリストに表示する
    setEntries((previous) => [...previous, optimisticEntry]);
    setAmount('');
    setNote('');
    setShowForm(false);

    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        type: entryType,
        category,
        amount: numericAmount,
        note: note || undefined,
      }),
    });

    if (!response.ok) {
      // 失敗時は楽観的エントリを取り除く
      setEntries((previous) =>
        previous.filter((entry) => entry.id !== optimisticId),
      );
      return;
    }

    const savedEntry = (await response.json()) as Entry;
    // サーバーの実エントリで楽観的エントリを置き換える
    const cacheKey = `${year}-${month}`;
    setEntries((previous) => {
      const updated = previous.map((entry) =>
        entry.id === optimisticId ? savedEntry : entry,
      );
      entriesCache.current.set(cacheKey, updated);
      return updated;
    });
  }, [selectedDate, amount, entryType, category, note, year, month]);

  const handleFormSubmit = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      void handleSave();
    },
    [handleSave],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-gray-500">支出</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isLoadingEntries ? '---' : formatSummaryAmount(monthlyExpense)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">収入</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isLoadingEntries ? '---' : formatSummaryAmount(monthlyIncome)}
          </p>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${isLoadingEntries ? 'bg-white' : monthlyBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <Wallet
              className={`h-4 w-4 ${isLoadingEntries ? 'text-gray-400' : monthlyBalance >= 0 ? 'text-green-500' : 'text-red-400'}`}
            />
            <span className="text-xs font-medium text-gray-500">収支</span>
          </div>
          <p
            className={`text-lg font-bold ${isLoadingEntries ? 'text-gray-900' : monthlyBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {isLoadingEntries
              ? '---'
              : `${monthlyBalance >= 0 ? '+' : ''}${formatSummaryAmount(Math.abs(monthlyBalance))}`}
          </p>
        </div>
      </div>

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
            disabled={isMaxMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
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
            {!showForm && (
              <button
                onClick={handleShowAddForm}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            )}
          </div>

          {selectedEntries.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedEntries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                  isPending={entry.id.startsWith('optimistic-')}
                />
              ))}
            </div>
          )}

          {selectedEntries.length === 0 && !showForm && (
            <p className="py-4 text-center text-sm text-gray-400">
              この日の記録はありません
            </p>
          )}

          {showForm && (
            <form
              onSubmit={handleFormSubmit}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">新しい記録</h4>
                <button
                  type="button"
                  onClick={handleHideForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  type="button"
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
                  type="button"
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
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleHideForm}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!amount || parseAmountInput(amount) <= 0}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  保存
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
