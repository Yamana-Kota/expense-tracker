// このファイルはブラウザ側で実行されるクライアントコンポーネント。
// useState などのフックを使うために必須の宣言。
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

// ---- 型定義 ----------------------------------------------------------------

// ユニオン型：'expense'（支出）か 'income'（収入）のどちらかしか入れられない。
type EntryType = 'expense' | 'income';

// オブジェクトの型定義。`type` キーワードで型エイリアスを作る。
// この型に合わないオブジェクトを使おうとするとコンパイルエラーになる。
type Entry = {
  id: number; // ユニーク ID（数値）
  date: string; // 'YYYY-MM-DD' 形式の日付文字列
  type: EntryType; // 上で定義したユニオン型
  category: string;
  amount: number;
  note: string;
};

// ---- 初期データ -------------------------------------------------------------

// コンポーネント外に置くことで、レンダリングのたびに再生成されない。
// `Entry[]` は Entry 型の配列を表す。
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

// ---- 定数 ------------------------------------------------------------------

// `const` で定数を定義。大文字スネークケースは「変更しない定数」の慣習的な命名。
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

// ---- ユーティリティ関数 -----------------------------------------------------
// コンポーネントの外に純粋関数として切り出すことで、ロジックをシンプルに保てる。
// 「純粋関数」= 同じ引数を渡せば必ず同じ値を返す関数（副作用なし）。

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
    // Array.reduce() は配列を1つの値に畳み込む。
    // ここでは「entry の amount をすべて足し合わせた合計」を求めている。
    // (sum, entry) => sum + entry.amount で、sum が累積値、entry が現在の要素。
    // 0 は初期値。
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
  if (!amount) return null; // 早期リターン：条件を満たさなければすぐ return する
  return {
    id: Date.now(), // ミリ秒タイムスタンプをユニーク ID として使用
    date: selectedDate,
    type: entryType,
    category,
    // Number(amount) で文字列を数値に変換する。
    // フォームの value は常に string なので変換が必要。
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
  // 三項演算子：条件 ? 真の値 : 偽の値
  return type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
}

// ---- コンポーネント ---------------------------------------------------------

/**
 * 手動登録タブコンポーネント
 *
 * カレンダー形式で日付を選択し、収支エントリを追加・一覧表示する。
 * 月移動・日付選択・フォーム表示・エントリ保存の state を管理する。
 */
export default function ManualEntryTab() {
  // new Date() で現在の日時オブジェクトを取得する。
  // コンポーネント関数の本体は毎レンダリング時に実行されるが、
  // これはレンダリング時点の日付なので問題ない。
  const today = new Date();
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(), // JavaScript の月は 0 始まり（0=1月, 11=12月）
    today.getDate(),
  );

  // ---- state の定義 --------------------------------------------------------
  // useState の初期値に new Date() を渡す。
  // new Date(year, month, 1) で「その月の1日」を作る。
  // currentMonth は「カレンダーに表示している月」を表す。
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // <string | null> は「文字列 または null」のユニオン型。
  // null は「何も選択されていない」状態を表す。
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  // フォームの表示・非表示フラグ
  const [showForm, setShowForm] = useState(false);

  // フォームの各入力値を state で管理する（controlled component パターン）。
  // フォームの value を state で制御することで、React が入力の「真の状態」を管理する。
  const [entryType, setEntryType] = useState<EntryType>('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Entry の配列を state で管理する。
  // 初期値として initialEntries を渡す。
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  // ---- カレンダー計算 -------------------------------------------------------

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // new Date(year, month, 1).getDay() で「月の最初の日が何曜日か」を取得する。
  // 0=日曜, 1=月曜, ..., 6=土曜
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // new Date(year, month + 1, 0) のトリック：
  // 「翌月の0日目」= 「今月の最終日」。これでその月の日数がわかる。
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // selectedDate が null でない場合だけ entries を検索する。
  // null の場合は空配列を返す（短絡評価でフィルタを避ける）。
  const selectedEntries = selectedDate
    ? getEntriesForDate(entries, selectedDate)
    : [];

  // ---- イベントハンドラ -----------------------------------------------------
  // すべて useCallback でメモ化。DayCell などの子コンポーネントへ渡す関数は
  // メモ化しないと、毎レンダリングで新しい関数参照が生まれて子が再レンダリングされる。

  // 前月に移動する。
  // setCurrentMonth に「関数」を渡すパターン（関数型更新）。
  // 引数 previous は「更新前の state の値」。非同期更新でも安全に前の値を参照できる。
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  }, []); // 依存配列が空なので、この関数は一度しか生成されない

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
    );
  }, []);

  // 日付セルをクリックしたときの処理。
  // isSelected が true（すでに選択中）なら null にして選択解除、
  // false なら dateStr を選択する（トグル動作）。
  const handleDaySelect = useCallback(
    (dateStr: string, isSelected: boolean) => {
      setSelectedDate(isSelected ? null : dateStr);
      setShowForm(false);
    },
    [],
  );

  // 「追加」ボタンを押したとき：フォームを表示し、入力値をリセットする。
  const handleShowAddForm = useCallback(() => {
    setShowForm(true);
    setEntryType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    setAmount('');
    setNote('');
  }, []);

  const handleHideForm = useCallback(() => setShowForm(false), []);

  // 支出・収入ボタンの切り替えハンドラ。
  // カテゴリも同時にデフォルト値にリセットする。
  const handleSelectExpense = useCallback(() => {
    setEntryType('expense');
    setCategory(resolveDefaultCategory('expense'));
  }, []);

  const handleSelectIncome = useCallback(() => {
    setEntryType('income');
    setCategory(resolveDefaultCategory('income'));
  }, []);

  // フォーム要素の onChange ハンドラ。
  // React.ChangeEvent<HTMLSelectElement> は「select 要素の変更イベント」の型。
  // event.target.value で選択された値を取得する。
  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCategory(event.target.value);
    },
    [],
  );

  // React.ChangeEvent<HTMLInputElement> は「input 要素の変更イベント」の型。
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

  // 保存ボタンのハンドラ。
  // 依存配列に [selectedDate, amount, entryType, category, note] を指定している。
  // これらの値が変わるたびに関数が再生成される（最新の state を参照するため必要）。
  const handleSave = useCallback(() => {
    if (!selectedDate) return; // 日付未選択なら何もしない
    const entry = buildEntry(selectedDate, amount, entryType, category, note);
    if (!entry) return; // amount が空なら何もしない

    // setEntries に関数を渡す（関数型更新）。
    // previous は更新前の配列。スプレッド構文 [...previous, entry] で
    // 既存の配列に entry を追加した「新しい配列」を作る。
    // React の state は直接変更（ミューテート）してはいけない。必ず新しい値を返す。
    setEntries((previous) => [...previous, entry]);
    setAmount('');
    setNote('');
    setShowForm(false);
  }, [selectedDate, amount, entryType, category, note]);

  // ---- JSX（見た目の定義） --------------------------------------------------
  return (
    // space-y-4 は Tailwind CSS のクラス。子要素の間に上下方向の余白を追加する。
    <div className="space-y-4">
      {/* カレンダー */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        {/* ヘッダー：前月・年月表示・次月 */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {/* JSX の {} 内には JavaScript の式を書ける。month は 0 始まりなので +1 する。 */}
            {year}年{month + 1}月
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 曜日ヘッダー（日〜土） */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              // テンプレートリテラルでクラス名を動的に組み立てる。
              // 三項演算子のネスト：日曜は赤、土曜は青、それ以外はグレー。
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

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {/* 月の最初の曜日まで空のセルを並べてカレンダーを整列させる。
              Array.from({ length: n }) は n 個の要素を持つ配列を作るトリック。
              _ は「使わない引数」の慣習的な名前（アンダースコア）。 */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* その月の日数分だけ DayCell を並べる。
              index は 0 始まりなので、day = index + 1 で 1 始まりの日付にする。 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = toDateStr(year, month, day);
            // オブジェクトの分割代入で expense と income を取り出す。
            const { expense, income } = getDayTotals(entries, year, month, day);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            // % 7 で曜日を求める（0=日, 6=土）。
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

      {/* 選択日の詳細パネル。
          selectedDate が null（falsy）のときは何も描画しない。
          selectedDate が文字列（truthy）のときだけ中身を描画する。 */}
      {selectedDate && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {/* new Date(selectedDate + 'T00:00:00') のように時刻を付けることで、
                  タイムゾーンのズレによる日付のずれを防ぐ。
                  toLocaleDateString() で日本語ロケールの日付文字列に変換する。 */}
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

          {/* エントリーリスト。
              selectedEntries.length > 0 のときだけ表示する。 */}
          {selectedEntries.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* 三項演算子でアイコンを切り替える。
                        JSX の {} 内には式しか書けないため、if 文の代わりに三項演算子を使う。 */}
                    {entry.type === 'expense' ? (
                      <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-400" />
                    ) : (
                      <TrendingUp className="h-4 w-4 flex-shrink-0 text-green-500" />
                    )}
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        {entry.category}
                      </span>
                      {/* entry.note が空文字（falsy）のときは何も表示しない。 */}
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
                    {/* 支出なら '-'、収入なら '+' を先頭に付ける。
                        toLocaleString() で数値を 3 桁区切りの文字列にする（例: 3200 → '3,200'）。 */}
                    {entry.type === 'expense' ? '-' : '+'}¥
                    {entry.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 記録がなく、フォームも非表示のときだけ「記録なし」テキストを表示する。 */}
          {selectedEntries.length === 0 && !showForm && (
            <p className="py-4 text-center text-sm text-gray-400">
              この日の記録はありません
            </p>
          )}

          {/* 入力フォーム。showForm が true のときだけ表示する。 */}
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

              {/* 収支切り替えボタン。
                  entryType の値に応じてボタンの見た目を変える。 */}
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
                {/* カテゴリの select。
                    value={category} で現在の state を表示し、
                    onChange={handleCategoryChange} でユーザーの選択を state に反映する。
                    これが「controlled component（制御されたコンポーネント）」パターン。 */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    カテゴリ
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {/* entryType に応じてカテゴリリストを切り替える。
                        括弧でグループ化して三項演算子を使い、map を続けて呼べるようにする。 */}
                    {(entryType === 'expense'
                      ? EXPENSE_CATEGORIES
                      : INCOME_CATEGORIES
                    ).map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 金額の input。type="number" で数値入力専用にする。 */}
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

                {/* メモの input。type="text" は通常のテキスト入力。 */}
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
                  // disabled 属性：!amount が true（amount が空）のときボタンを無効化する。
                  // disabled:opacity-40 などの Tailwind クラスが disabled 時に適用される。
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
