// カテゴリ別の支出データ（現在はモックデータ）。
// percentage はプログレスバーの幅に使う（0〜100 の数値）。
// color は Tailwind の背景色クラス名（文字列として保持）。
const categoryData = [
  { name: '食費', amount: 45200, percentage: 36, color: 'bg-blue-500' },
  { name: '外食', amount: 18600, percentage: 15, color: 'bg-indigo-400' },
  { name: '交通費', amount: 12400, percentage: 10, color: 'bg-violet-400' },
  { name: '娯楽', amount: 22000, percentage: 17, color: 'bg-pink-400' },
  { name: '日用品', amount: 15800, percentage: 12, color: 'bg-orange-400' },
  { name: 'その他', amount: 13420, percentage: 10, color: 'bg-gray-300' },
];

/**
 * カテゴリ別支出グラフコンポーネント
 *
 * カテゴリごとの支出金額をプログレスバー形式で表示する。
 * 凡例・カテゴリ名・金額・割合をあわせて一覧表示する。
 */
export default function CategoryExpenseChart() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-5 font-bold text-gray-900">カテゴリ別支出</h3>

      {/* 凡例（カラードット + カテゴリ名） */}
      <div className="mb-5 flex flex-wrap gap-2">
        {categoryData.map((cat) => (
          <div key={cat.name} className="flex items-center gap-1.5">
            {/* cat.color は Tailwind クラス名の文字列（例: 'bg-blue-500'）。
                動的なクラス名は Tailwind の JIT モードで正しく処理される。 */}
            <div className={`h-2.5 w-2.5 rounded-sm ${cat.color}`} />
            <span className="text-xs text-gray-600">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 各カテゴリのプログレスバー */}
      <div className="space-y-3">
        {categoryData.map((cat) => (
          <div key={cat.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                <span className="font-medium text-gray-800">{cat.name}</span>
              </div>
              <span className="text-gray-500">
                ¥{cat.amount.toLocaleString()}
                <span className="ml-1 text-xs text-gray-400">
                  ({cat.percentage}%)
                </span>
              </span>
            </div>
            {/* プログレスバー本体。
                overflow-hidden で子要素が親の角丸から飛び出さないようにする。 */}
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              {/* CSS カスタムプロパティ（CSS 変数）を React から設定するパターン。
                  style 属性に `{ '--progress-width': '36%' }` のようなオブジェクトを渡す。
                  TypeScript では通常の CSS プロパティしか型として認識しないため、
                  `as React.CSSProperties` でキャストして型エラーを回避する。
                  globals.css の .progress-fill クラスが --progress-width 変数を参照して
                  実際のアニメーション付き幅を設定している。 */}
              <div
                className={`progress-fill h-full rounded-full ${cat.color} transition-all duration-700`}
                style={
                  {
                    '--progress-width': `${cat.percentage}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
