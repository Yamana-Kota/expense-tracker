'use client';

import { useCallback } from 'react';

type DayCellProps = {
  day: number;
  dateStr: string;
  expense: number;
  income: number;
  isSelected: boolean;
  isToday: boolean;
  dayOfWeek: number;
  onSelect: (dateStr: string, isSelected: boolean) => void;
};

/**
 * カレンダーの1日分のセルコンポーネント
 *
 * 日付・曜日・支出/収入の金額を表示し、クリックで選択状態をトグルする。
 * 選択状態・当日・曜日に応じてスタイルを動的に変える。
 *
 * @param day - 日付（1〜31）
 * @param dateStr - 日付文字列（'YYYY-MM-DD' 形式）
 * @param expense - 支出合計（0 のとき非表示）
 * @param income - 収入合計（0 のとき非表示）
 * @param isSelected - 選択中フラグ
 * @param isToday - 当日フラグ
 * @param dayOfWeek - 曜日（0=日, 6=土）
 * @param onSelect - 選択変更コールバック
 *
 * @remarks
 * このコンポーネントはカレンダーの日数分（最大31個）生成されるため、
 * パフォーマンスのために useCallback でメモ化されたコールバックを受け取る設計にしている。
 */
function DayCell({
  day,
  dateStr,
  expense,
  income,
  isSelected,
  isToday,
  dayOfWeek,
  onSelect,
}: DayCellProps) {
  const handleClick = useCallback(
    () => onSelect(dateStr, isSelected),
    [dateStr, isSelected, onSelect],
  );

  return (
    <button
      onClick={handleClick}
      className={`calendar-day-cell relative flex flex-col items-center rounded-xl px-0.5 py-2.5 transition-all ${
        isSelected
          ? 'bg-blue-600 shadow-md'
          : isToday
            ? 'bg-blue-50 ring-2 ring-blue-300'
            : 'hover:bg-gray-50'
      }`}
    >
      <span
        className={`text-base font-bold leading-none ${
          isSelected
            ? 'text-white'
            : isToday
              ? 'text-blue-600'
              : dayOfWeek === 0
                ? 'text-red-400'
                : dayOfWeek === 6
                  ? 'text-blue-400'
                  : 'text-gray-800'
        }`}
      >
        {day}
      </span>

      <div className="mt-1.5 flex w-full flex-col items-center gap-0.5">
        {expense > 0 && (
          <span
            className={`calendar-amount-label w-full truncate text-center ${
              isSelected ? 'text-red-200' : 'text-red-400'
            }`}
          >
            -¥{expense.toLocaleString()}
          </span>
        )}
        {income > 0 && (
          <span
            className={`calendar-amount-label w-full truncate text-center ${
              isSelected ? 'text-green-200' : 'text-green-500'
            }`}
          >
            +¥{income.toLocaleString()}
          </span>
        )}
      </div>
    </button>
  );
}

export default DayCell;
