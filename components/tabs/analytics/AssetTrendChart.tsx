// 資産推移データ（月次）。
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

// SVG の内部座標系のサイズ。viewBox で指定する幅・高さ（ピクセルではなく座標単位）。
// 実際の表示サイズは width="100%" で親要素に合わせて拡縮する。
const ASSET_CHART_W = 500;
const ASSET_CHART_H = 160;
// チャートのプロット領域の余白（上下左右）。
// 余白にグリッド線のラベルやX軸ラベルを配置する。
const ASSET_PADDING_TOP = 20;
const ASSET_PADDING_RIGHT = 16;
const ASSET_PADDING_BOTTOM = 28;
const ASSET_PADDING_LEFT = 44;
// プロット領域の実際の幅・高さ（全体サイズから余白を引いた値）。
const ASSET_PLOT_W = ASSET_CHART_W - ASSET_PADDING_LEFT - ASSET_PADDING_RIGHT;
const ASSET_PLOT_H = ASSET_CHART_H - ASSET_PADDING_TOP - ASSET_PADDING_BOTTOM;
// Y 軸の値の範囲。
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
  // (index / (total - 1)) で 0〜1 の割合を求め、プロット幅を掛けて座標に変換する。
  // 左余白（ASSET_PADDING_LEFT）を足してプロット領域内に配置する。
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
  // (value - Y_MIN) / (Y_MAX - Y_MIN) で 0〜1 の割合を求める。
  // ASSET_PLOT_H を掛けてプロット高さのピクセル数に変換し、
  // SVG の Y 軸が上から下向きなので ASSET_PLOT_H から引いて上下を反転させる。
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
  // map で各データ点の "x,y" 文字列を生成し、join(' ') でスペース区切りに結合する。
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
  // プロット領域の下端（Y座標の最大値 = チャートの底）。
  const bottom = ASSET_PADDING_TOP + ASSET_PLOT_H;
  const firstX = toAssetX(0, data.length);
  const lastX = toAssetX(data.length - 1, data.length);
  // M: 左下から始まり、L: 各データ点を通り、L: 右下に戻り、Z: 閉じる。
  // これで折れ線の下に閉じた領域（エリアチャート）が作られる。
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

      {/* SVG 要素。viewBox でチャートの内部座標系を定義する。
          viewBox="0 0 500 160" = 「0,0 から始まる 500×160 の座標系」。
          width="100%" で実際の表示サイズは親要素の幅に合わせて拡縮される。
          aria-label でスクリーンリーダー向けの説明を付ける（アクセシビリティ）。 */}
      <svg
        viewBox={`0 0 ${ASSET_CHART_W} ${ASSET_CHART_H}`}
        width="100%"
        aria-label="資産推移グラフ"
      >
        {/* defs はグラデーションやフィルターなど「使い回す定義」を置く SVG の要素。
            定義だけで画面には何も描画されない。 */}
        <defs>
          {/* linearGradient はグラデーションの定義。
              x1,y1 → x2,y2 の方向でグラデーションをかける。
              ここでは上（y1=0）から下（y2=1）への縦グラデーション。
              stop で色と位置を指定。stopOpacity で透明度を設定。 */}
          <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y 軸のグリッド線とラベルを描画する。
            <g> は SVG のグループ要素。論理的にまとめるために使う（見た目への影響なし）。 */}
        {ASSET_Y_TICKS.map((tick) => {
          const y = toAssetY(tick);
          return (
            <g key={tick}>
              {/* <line> で水平グリッド線を描く。
                  x1,y1 が始点、x2,y2 が終点。stroke で色、strokeWidth で太さ。 */}
              <line
                x1={ASSET_PADDING_LEFT}
                y1={y}
                x2={ASSET_CHART_W - ASSET_PADDING_RIGHT}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              {/* <text> で Y 軸のラベルを描く。
                  textAnchor="end" で x 座標を右端に揃える。
                  dominantBaseline="middle" で y 座標を文字の中央に揃える。 */}
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

        {/* エリア（塗りつぶし）。
            fill="url(#assetGradient)" で defs で定義したグラデーションを参照する。 */}
        <path d={buildAssetAreaPath(assetData)} fill="url(#assetGradient)" />

        {/* 折れ線。
            <polyline> は複数の点を直線でつないだ折れ線を描く SVG 要素。
            fill="none" で内部の塗りつぶしなし、stroke で線の色を指定。
            strokeLinecap="round" で線の端を丸くし、strokeLinejoin="round" で折れ目も丸くする。 */}
        <polyline
          points={buildAssetPolylinePoints(assetData)}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* データポイント（点）と X 軸ラベル */}
        {assetData.map((d, index) => {
          const x = toAssetX(index, assetData.length);
          const y = toAssetY(d.asset);
          return (
            <g key={d.label}>
              {/* <circle> で点を描く。cx, cy が中心座標、r が半径。 */}
              <circle cx={x} cy={y} r="3" fill="#6366f1" />
              {/* index % 2 === 0 で偶数インデックスのみラベルを表示する（ラベルが混みすぎないように）。
                  % は剰余演算子（余り）。偶数は 0, 2, 4... で 2 で割った余りが 0。 */}
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

      {/* 凡例 */}
      <div className="mt-2 flex justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
          <span className="text-xs text-gray-500">資産額</span>
        </div>
      </div>
    </div>
  );
}
