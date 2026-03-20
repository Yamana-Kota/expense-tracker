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

/**
 * データのインデックスから SVG の X 座標を計算する
 *
 * データ点を等間隔に配置するため、インデックスをプロット幅に対する割合に変換する。
 *
 * @param index - データのインデックス（0 始まり）
 * @param total - データの総数
 * @returns SVG の X 座標値
 */
function toAssetX(index: number, total: number): number {
  return ASSET_PADDING_LEFT + (index / (total - 1)) * ASSET_PLOT_W;
}

/**
 * 資産値から SVG の Y 座標を計算する
 *
 * SVG の Y 軸は上が 0 で下が大きくなるため、値が大きいほど Y 座標は小さくなる
 * （上に行くほど大きな値を表す）。
 *
 * @param value - 資産額（円）
 * @returns SVG の Y 座標値
 */
function toAssetY(value: number): number {
  return (
    ASSET_PADDING_TOP +
    ASSET_PLOT_H -
    ((value - ASSET_Y_MIN) / (ASSET_Y_MAX - ASSET_Y_MIN)) * ASSET_PLOT_H
  );
}

/**
 * 折れ線グラフ（polyline）の points 属性の値を生成する
 *
 * SVG の polyline 要素は "x1,y1 x2,y2 x3,y3 ..." 形式の文字列を受け取る。
 *
 * @param data - 資産データの配列
 * @returns polyline の points 属性値（文字列）
 */
function buildAssetPolylinePoints(data: { asset: number }[]): string {
  return data
    .map((d, index) => `${toAssetX(index, data.length)},${toAssetY(d.asset)}`)
    .join(' ');
}

/**
 * 折れ線グラフ下の塗りつぶしエリア用の SVG パス文字列を生成する
 *
 * SVG の path 要素の d 属性に指定するコマンド列を生成する。
 * M（移動）、L（直線）、Z（閉じる）のコマンドを使って折れ線の下を閉じた形にする。
 *
 * @param data - 資産データの配列
 * @returns path の d 属性値（SVG パスコマンド文字列）
 */
function buildAssetAreaPath(data: { asset: number }[]): string {
  const points = data.map(
    (d, index) => `${toAssetX(index, data.length)},${toAssetY(d.asset)}`,
  );
  const bottom = ASSET_PADDING_TOP + ASSET_PLOT_H;
  const firstX = toAssetX(0, data.length);
  const lastX = toAssetX(data.length - 1, data.length);
  return `M ${firstX},${bottom} L ${points.join(' L ')} L ${lastX},${bottom} Z`;
}

/**
 * 資産推移グラフコンポーネント
 *
 * 全期間の資産額を SVG の折れ線グラフ（エリアチャート）で表示する。
 * Y 軸グリッド線・データポイント・X 軸ラベルを SVG で描画する。
 */
export default function AssetTrendChart() {
  return (
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

        <path d={buildAssetAreaPath(assetData)} fill="url(#assetGradient)" />

        <polyline
          points={buildAssetPolylinePoints(assetData)}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

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
  );
}
