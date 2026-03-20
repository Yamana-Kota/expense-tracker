const monthlyData = [
  { month: '10月', expense: 98000, income: 250000 },
  { month: '11月', expense: 112000, income: 250000 },
  { month: '12月', expense: 145000, income: 320000 },
  { month: '1月', expense: 89000, income: 250000 },
  { month: '2月', expense: 103000, income: 250000 },
  { month: '3月', expense: 127420, income: 250000 },
];

const BAR_HEIGHT = 100;
const Y_AXIS_MAX = 350000;
const Y_TICKS = [0, 100000, 200000, 300000];

/**
 * 月別収支推移グラフコンポーネント
 *
 * 過去6ヶ月の収入と支出を月ごとの縦棒グラフで表示する。
 * Y 軸ラベル・グリッド線・凡例を含む。
 */
export default function MonthlyTrendChart() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-5 font-bold text-gray-900">月別推移（過去6ヶ月）</h3>

      <div className="flex gap-2">
        <div
          className="relative flex-none"
          style={{ width: '2rem', height: `${BAR_HEIGHT}px` }}
        >
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="chart-y-label absolute right-0 text-[10px] leading-none text-gray-400"
              style={
                {
                  '--y-label-bottom': `${(tick / Y_AXIS_MAX) * BAR_HEIGHT}px`,
                } as React.CSSProperties
              }
            >
              {tick === 0 ? '0' : `${tick / 10000}万`}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {Y_TICKS.map((tick) => (
            <div
              key={tick}
              className="chart-y-gridline absolute left-0 right-0 border-t border-gray-100"
              style={
                {
                  '--y-label-bottom': `${(tick / Y_AXIS_MAX) * BAR_HEIGHT}px`,
                } as React.CSSProperties
              }
            />
          ))}

          <div
            className="flex items-end justify-between gap-1"
            style={{ height: `${BAR_HEIGHT}px` }}
          >
            {monthlyData.map((data) => (
              <div
                key={data.month}
                className="flex flex-1 items-end justify-center"
              >
                <div className="flex items-end gap-0.5">
                  <div
                    className="chart-bar w-4 rounded-t-md bg-green-400 transition-all duration-700"
                    style={
                      {
                        '--chart-height': `${(data.income / Y_AXIS_MAX) * BAR_HEIGHT}px`,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="chart-bar w-4 rounded-t-md bg-red-400 transition-all duration-700"
                    style={
                      {
                        '--chart-height': `${(data.expense / Y_AXIS_MAX) * BAR_HEIGHT}px`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex justify-between gap-1">
            {monthlyData.map((data) => (
              <span
                key={data.month}
                className="flex-1 text-center text-xs text-gray-400"
              >
                {data.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-green-400" />
          <span className="text-xs text-gray-500">収入</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-400" />
          <span className="text-xs text-gray-500">支出</span>
        </div>
      </div>
    </div>
  );
}
