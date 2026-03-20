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

      <div className="mb-5 flex flex-wrap gap-2">
        {categoryData.map((cat) => (
          <div key={cat.name} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${cat.color}`} />
            <span className="text-xs text-gray-600">{cat.name}</span>
          </div>
        ))}
      </div>

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
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
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
