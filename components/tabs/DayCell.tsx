'use client';

import { useCallback } from 'react';

// カレンダーの1日分のセルに渡す props の型定義。
// ManualEntryTab.tsx から DayCell コンポーネントへ渡される。
type DayCellProps = {
  day: number; // 日付（1〜31）
  dateStr: string; // 'YYYY-MM-DD' 形式の日付文字列
  expense: number; // その日の支出合計（円）。0 のときは何も表示しない。
  income: number; // その日の収入合計（円）。0 のときは何も表示しない。
  isSelected: boolean; // このセルが選択中かどうか
  isToday: boolean; // このセルが今日かどうか
  dayOfWeek: number; // 曜日（0=日曜, 1=月曜, ..., 6=土曜）
  // 関数の型定義: 引数と戻り値の型を `(引数名: 型) => 戻り値の型` で表す。
  // void は「何も返さない」を意味する TypeScript の型。
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
  // クリックされたら親に「このセルの dateStr と現在の選択状態」を伝える。
  // 依存配列 [dateStr, isSelected, onSelect] のいずれかが変わると関数が再生成される。
  // これらの値はセルごとに異なるため、各セルが独自のハンドラを持つ。
  const handleClick = useCallback(
    () => onSelect(dateStr, isSelected),
    [dateStr, isSelected, onSelect],
  );

  return (
    // button 要素にすることで、キーボード操作（Tab・Enter）でも選択できる（アクセシビリティ）。
    // relative は子要素を absolute 配置するための基点になる（現在は使用していないが慣習として）。
    <button
      onClick={handleClick}
      // 複数の条件でクラスを切り替えるネストした三項演算子。
      // 優先度：選択中 > 当日 > 通常（ホバー）
      className={`calendar-day-cell relative flex flex-col items-center rounded-xl px-0.5 py-2.5 transition-all ${
        isSelected
          ? 'bg-blue-600 shadow-md' // 選択中：青背景
          : isToday
            ? 'bg-blue-50 ring-2 ring-blue-300' // 当日：薄青背景 + 青枠
            : 'hover:bg-gray-50' // 通常：ホバーでグレー
      }`}
    >
      {/* 日付の数字。曜日・選択状態で文字色を変える。
          こちらも三項演算子をネストして条件分岐している。 */}
      <span
        className={`text-base font-bold leading-none ${
          isSelected
            ? 'text-white' // 選択中は白文字
            : isToday
              ? 'text-blue-600' // 当日は青文字
              : dayOfWeek === 0
                ? 'text-red-400' // 日曜は赤文字
                : dayOfWeek === 6
                  ? 'text-blue-400' // 土曜は青文字
                  : 'text-gray-800' // 平日はグレー文字
        }`}
      >
        {day}
      </span>

      {/* 金額表示エリア。expense や income が 0 のときは && の短絡評価で何も表示しない。 */}
      <div className="mt-1.5 flex w-full flex-col items-center gap-0.5">
        {/* expense > 0 のときだけ支出金額を表示する。
            truncate で文字が長すぎる場合に「...」で省略する。 */}
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
