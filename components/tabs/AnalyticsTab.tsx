'use client';

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const categoryData = [
  { name: '食費', amount: 45200, percentage: 36, color: 'bg-blue-500' },
  { name: '外食', amount: 18600, percentage: 15, color: 'bg-indigo-400' },
  { name: '交通費', amount: 12400, percentage: 10, color: 'bg-violet-400' },
  { name: '娯楽', amount: 22000, percentage: 17, color: 'bg-pink-400' },
  { name: '日用品', amount: 15800, percentage: 12, color: 'bg-orange-400' },
  { name: 'その他', amount: 13420, percentage: 10, color: 'bg-gray-300' },
];

const monthlyData = [
  { month: '10月', expense: 98000, income: 250000 },
  { month: '11月', expense: 112000, income: 250000 },
  { month: '12月', expense: 145000, income: 320000 },
  { month: '1月', expense: 89000, income: 250000 },
  { month: '2月', expense: 103000, income: 250000 },
  { month: '3月', expense: 127420, income: 250000 },
];

const assetData = [
  { label: '25/4', asset: 980000 },
  { label: '25/5', asset: 1100000 },
  { label: '25/6', asset: 1250000 },
  { label: '25/7', asset: 1380000 },
  { label: '25/8', asset: 1520000 },
  { label: '25/9', asset: 1680000 },
  { label: '25/10', asset: 1820000 },
  { label: '25/11', asset: 1955000 },
  { label: '25/12', asset: 2130000 },
  { label: '26/1', asset: 2290000 },
  { label: '26/2', asset: 2440000 },
  { label: '26/3', asset: 2580000 },
];

const BAR_HEIGHT = 100;
const Y_AXIS_MAX = 350000;
const Y_TICKS = [0, 100000, 200000, 300000];

const ASSET_CHART_W = 500;
const ASSET_CHART_H = 160;
const ASSET_PADDING_TOP = 20;
const ASSET_PADDING_RIGHT = 16;
const ASSET_PADDING_BOTTOM = 28;
const ASSET_PADDING_LEFT = 44;
const ASSET_PLOT_W = ASSET_CHART_W - ASSET_PADDING_LEFT - ASSET_PADDING_RIGHT;
const ASSET_PLOT_H = ASSET_CHART_H - ASSET_PADDING_TOP - ASSET_PADDING_BOTTOM;
const ASSET_Y_MIN = 0;
const ASSET_Y_MAX = 3000000;
const ASSET_Y_TICKS = [0, 1000000, 2000000, 3000000];

const totalExpense = 127420;
const totalIncome = 250000;
const balance = totalIncome - totalExpense;

function toAssetX(index: number, total: number): number {
  return ASSET_PADDING_LEFT + (index / (total - 1)) * ASSET_PLOT_W;
}

function toAssetY(value: number): number {
  return (
    ASSET_PADDING_TOP +
    ASSET_PLOT_H -
    ((value - ASSET_Y_MIN) / (ASSET_Y_MAX - ASSET_Y_MIN)) * ASSET_PLOT_H
  );
}

function buildAssetPolylinePoints(data: { asset: number }[]): string {
  return data
    .map((d, index) => `${toAssetX(index, data.length)},${toAssetY(d.asset)}`)
    .join(' ');
}

function buildAssetAreaPath(data: { asset: number }[]): string {
  const points = data.map(
    (d, index) => `${toAssetX(index, data.length)},${toAssetY(d.asset)}`,
  );
  const bottom = ASSET_PADDING_TOP + ASSET_PLOT_H;
  const firstX = toAssetX(0, data.length);
  const lastX = toAssetX(data.length - 1, data.length);
  return `M ${firstX},${bottom} L ${points.join(' L ')} L ${lastX},${bottom} Z`;
}

export default function AnalyticsTab() {
  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-gray-500">支出</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ¥{(totalExpense / 10000).toFixed(1)}万
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">収入</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ¥{(totalIncome / 10000).toFixed(0)}万
          </p>
        </div>
        <div
          className={`rounded-2xl p-4 shadow-sm ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <Wallet
              className={`h-4 w-4 ${balance >= 0 ? 'text-green-500' : 'text-red-400'}`}
            />
            <span className="text-xs font-medium text-gray-500">収支</span>
          </div>
          <p
            className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {balance >= 0 ? '+' : ''}¥{(balance / 10000).toFixed(1)}万
          </p>
        </div>
      </div>

      {/* カテゴリ別支出 */}
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

      {/* 月別推移 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-5 font-bold text-gray-900">月別推移（過去6ヶ月）</h3>

        <div className="flex gap-2">
          {/* Y軸ラベル */}
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

          {/* グラフエリア */}
          <div className="relative flex-1">
            {/* 横グリッド線 */}
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

            {/* バー */}
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

            {/* 月ラベル */}
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

      {/* 資産推移 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-5 font-bold text-gray-900">資産推移（全期間）</h3>

        <svg
          viewBox={`0 0 ${ASSET_CHART_W} ${ASSET_CHART_H}`}
          width="100%"
          aria-label="資産推移グラフ"
        >
          <defs>
            <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y軸グリッド線とラベル */}
          {ASSET_Y_TICKS.map((tick) => {
            const y = toAssetY(tick);
            return (
              <g key={tick}>
                <line
                  x1={ASSET_PADDING_LEFT}
                  y1={y}
                  x2={ASSET_CHART_W - ASSET_PADDING_RIGHT}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={ASSET_PADDING_LEFT - 4}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#9ca3af"
                >
                  {tick === 0 ? '0' : `${tick / 10000}万`}
                </text>
              </g>
            );
          })}

          {/* エリア塗りつぶし */}
          <path d={buildAssetAreaPath(assetData)} fill="url(#assetGradient)" />

          {/* 折れ線 */}
          <polyline
            points={buildAssetPolylinePoints(assetData)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* データポイントとX軸ラベル */}
          {assetData.map((d, index) => {
            const x = toAssetX(index, assetData.length);
            const y = toAssetY(d.asset);
            return (
              <g key={d.label}>
                <circle cx={x} cy={y} r="3" fill="#6366f1" />
                {index % 2 === 0 && (
                  <text
                    x={x}
                    y={ASSET_CHART_H - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            <span className="text-xs text-gray-500">資産額</span>
          </div>
        </div>
      </div>
    </div>
  );
}
