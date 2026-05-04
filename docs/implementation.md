# 実装ドキュメント（認証以外）

## 概要

Auto Expense は AWS Cognito 認証を持つ個人向け家計簿アプリ。本ドキュメントでは認証機能を除いたすべての実装を解説し、未実装の機能については **⚠️ 未実装** と明示する。

**凡例**
- ✅ 実装済み
- ⚠️ 未実装（UI プレースホルダーのみ、またはモックデータのみ）
- ❌ 未実装（コードなし）

---

## ファイル構成

```
expense-tracker/
├── app/
│   ├── layout.tsx                          # [修正] Providers でラップ
│   ├── page.tsx                            # ランディングページ (/)
│   ├── globals.css                         # グローバルスタイル・CSS 変数
│   └── dashboard/
│       ├── layout.tsx                      # ダッシュボードレイアウト（Header 含む）
│       └── page.tsx                        # タブナビゲーション管理
└── components/
    ├── Header.tsx                          # [修正] ロゴ・認証ボタン表示
    ├── TabButton.tsx                       # タブ切り替えボタン
    └── tabs/
        ├── ManualEntryTab.tsx              # ✅ 手動入力タブ（カレンダー＋フォーム）
        ├── DayCell.tsx                     # ✅ カレンダーセル
        ├── EntryRow.tsx                    # ✅ 収支一覧の行
        ├── ReceiptTab.tsx                  # ⚠️ レシートタブ（UI のみ）
        ├── AnalyticsTab.tsx                # ⚠️ グラフタブ（モックデータのみ）
        ├── SettingsTab.tsx                 # ⚠️ 設定タブ（Coming Soon のみ）
        └── analytics/
            ├── SummaryCards.tsx            # ⚠️ 収支サマリー（モックデータ）
            ├── CategoryExpenseChart.tsx    # ⚠️ カテゴリ別支出（モックデータ）
            ├── MonthlyTrendChart.tsx       # ⚠️ 月別推移グラフ（モックデータ）
            └── AssetTrendChart.tsx         # ⚠️ 資産推移グラフ（モックデータ）
```

---

## ランディングページ（`app/page.tsx`）✅

ユーザーが最初にアクセスする画面。サーバーコンポーネントとして実装されている。

**表示内容**

| 要素 | 説明 |
|---|---|
| アプリロゴ | Receipt アイコン＋青背景 |
| キャッチコピー | 「レシートを撮るだけでかんたん家計簿」 |
| 機能紹介カード | 3 枚（撮影するだけ・支出を見える化・時短で管理） |
| ログインボタン | `<SignInButton>`（クライアントコンポーネント）に委譲 |
| 同意文言 | 利用規約・プライバシーポリシーへの同意テキスト |

> **設計ポイント**: `signIn()` は `'use client'` が必要なため、ページ本体（サーバーコンポーネント）から直接呼べない。`SignInButton` を切り出すことで制約を回避している。

---

## ダッシュボードレイアウト（`app/dashboard/layout.tsx`）✅

`/dashboard` 配下のすべてのページを包むレイアウト。`Header` コンポーネントと `<main>` タグで構成される。

```
DashboardLayout
  ├── Header（ロゴ・認証ボタン）
  └── main > {children}（DashboardPage など）
```

---

## ダッシュボードページ（`app/dashboard/page.tsx`）✅

タブナビゲーションと各タブのコンテンツを管理するクライアントコンポーネント。

**タブ定義**

| id | ラベル | アイコン |
|---|---|---|
| `manual` | 手動登録 | `PenLine` |
| `receipt` | レシート登録 | `Camera` |
| `analytics` | グラフ | `BarChart3` |
| `settings` | 設定 | `Settings` |

**状態管理**

```typescript
type Tab = 'receipt' | 'manual' | 'analytics' | 'settings';
const [activeTab, setActiveTab] = useState<Tab>('manual');
```

デフォルトは `'manual'` タブ。`TabButton` に `onSelect` コールバックを渡し、タブの切り替えを行う。各タブは条件付きレンダリング（`{activeTab === 'xxx' && <XxxTab />}`）で表示する。

---

## 手動入力タブ（`ManualEntryTab.tsx`）✅

カレンダー形式で日付を選択し、収支エントリを追加・削除・表示する。アプリの中で唯一フルに実装されているタブ。

### データモデル

```typescript
type EntryType = 'expense' | 'income';

type Entry = {
  id: number;      // Date.now() で生成
  date: string;    // 'YYYY-MM-DD' 形式
  type: EntryType;
  category: string;
  amount: number;  // 円単位
  note: string;
};
```

**カテゴリ定数**

| 種別 | カテゴリ一覧 |
|---|---|
| 支出 | 食費・外食・交通費・娯楽・日用品・医療・衣服・その他 |
| 収入 | 給与・副業・ボーナス・贈り物・その他 |

> **⚠️ 未実装**: カテゴリはハードコードされており、ユーザーによるカスタマイズ機能はない。

### 状態一覧

| state | 型 | 初期値 | 説明 |
|---|---|---|---|
| `currentMonth` | `Date` | 当月1日 | 表示中の月 |
| `selectedDate` | `string \| null` | 今日 | 選択中の日付（`YYYY-MM-DD`） |
| `showForm` | `boolean` | `false` | 追加フォームの表示/非表示 |
| `entryType` | `EntryType` | `'expense'` | フォームの収支種別 |
| `category` | `string` | `'食費'` | フォームの選択カテゴリ |
| `amount` | `string` | `''` | フォームの金額（文字列） |
| `note` | `string` | `''` | フォームのメモ |
| `entries` | `Entry[]` | `initialEntries` | 登録済みエントリ一覧 |

> **⚠️ 未実装**: `entries` はインメモリ管理のみ。ページをリロードするとモックデータ（`initialEntries`）にリセットされる。データベースへの保存は未実装。

### サマリーカード（月次集計）

画面上部の3枚のカード（支出・収入・収支）。`getMonthlyTotals()` で `currentMonth` に対応する月のエントリを集計して表示する。

```
支出カード（赤）  収入カード（緑）  収支カード（±によって赤/緑）
```

金額表示は `formatSummaryAmount()` で整形。1万円以上は「X.X万円」形式。

### カレンダー

7列グリッドで月の日付を表示する。

| 処理 | 実装 |
|---|---|
| 月の初日の曜日 | `new Date(year, month, 1).getDay()` でオフセット計算 |
| 月の日数 | `new Date(year, month + 1, 0).getDate()` |
| 前月・次月移動 | `handlePrevMonth` / `handleNextMonth`（`setCurrentMonth` 更新） |
| 上限制御 | 来月まで（`maxMonth = 今日 + 12ヶ月 - 1`）で `disabled` |
| 曜日色分け | 日曜=赤、土曜=青、平日=グレー |
| 当日ハイライト | `ring-2 ring-blue-300 bg-blue-50` |
| 選択日ハイライト | `bg-blue-600`（文字色も白に変更） |
| 各日の金額表示 | `getDayTotals()` で支出/収入を計算し `DayCell` に渡す |

### DayCell コンポーネント

1日分のカレンダーセル。クリックで選択トグル（再クリックで解除）。

- 支出がある日 → 赤で「-X円」
- 収入がある日 → 緑で「+X円」
- 金額が 1 万円以上は `formatAmount()` で「万」単位に短縮

### 選択日の詳細パネル

日付を選択すると下部にパネルが出現する。

- その日のエントリ一覧（`EntryRow` で表示）
- 「追加」ボタン → 追加フォームを表示
- エントリがない場合は「この日の記録はありません」

### 追加フォーム

| フィールド | 入力形式 | バリデーション |
|---|---|---|
| 収支種別 | 支出/収入ボタン | 必須 |
| カテゴリ | `<select>` | 種別に応じて選択肢が切り替わる |
| 金額（円） | `<input type="number">` | 1以上の数値のみ保存ボタンが有効化 |
| メモ | `<input type="text">` | 任意 |

保存時は `buildEntry()` でオブジェクトを生成し、`setEntries(prev => [...prev, entry])` で追加。

> **⚠️ 未実装**: 編集機能はない。追加と削除のみ。

### エントリ削除

各 `EntryRow` の削除ボタンをクリックすると `handleDeleteEntry(id)` が発火し、`setEntries(prev => prev.filter(...))` でリストから除外する。

### ヘルパー関数一覧

| 関数 | 役割 |
|---|---|
| `toDateStr(year, month, day)` | 年月日 → `'YYYY-MM-DD'` 変換。month は 0 始まり |
| `formatSummaryAmount(amount)` | サマリー用整形（1万円以上は「X.X万円」） |
| `formatAmount(amount)` | カレンダーセル用整形（1万円以上は「X.X万」） |
| `getMonthlyTotals(entries, year, month)` | 月次支出・収入合計 |
| `getDayTotals(entries, year, month, day)` | 日次支出・収入合計 |
| `getEntriesForDate(entries, dateStr)` | 指定日のエントリ抽出 |
| `buildEntry(...)` | フォーム入力値 → `Entry` オブジェクト生成 |
| `resolveDefaultCategory(type)` | 収支種別に対応するデフォルトカテゴリ |

---

## レシートタブ（`ReceiptTab.tsx`）⚠️ 未実装

**現状**: UI プレースホルダーのみ。ボタンを押しても何も起きない。

```tsx
// ボタンに onClick ハンドラーなし
<button className="...">レシートを追加</button>
```

**今後実装が必要な内容**

| 機能 | 実装方針（案） |
|---|---|
| カメラ撮影 | Web Camera API（`getUserMedia`）または `<input type="file" capture>` |
| ファイルアップロード | `<input type="file" accept="image/*">` + multipart POST |
| OCR 処理 | サーバーサイドで AWS Textract または Google Cloud Vision API を呼び出す |
| 結果確認フォーム | OCR 結果をプレビューし、編集してから保存する UI |
| バックエンド API | `POST /api/receipts` でアップロード＋解析＋DB 保存 |

---

## グラフタブ（`AnalyticsTab.tsx`）⚠️ モックデータのみ

4 つのサブコンポーネントを縦に並べるコンテナ。各コンポーネントはすべてハードコードされたモックデータを表示しており、手動入力タブに登録したデータとは連動していない。

> **⚠️ 未実装**: すべてのグラフデータはハードコードされている。実際のエントリデータとの接続は未実装。

### SummaryCards ⚠️ モックデータ

今月の支出・収入・収支差額を 3 枚のカードで表示する。

```typescript
// ハードコードされたモックデータ
const totalExpense = 127420;
const totalIncome = 250000;
```

収支がプラスのとき緑背景、マイナスのとき赤背景で表示する。

### CategoryExpenseChart ⚠️ モックデータ

カテゴリごとの支出金額をプログレスバー形式で表示する。

```typescript
// ハードコードされたモックデータ
const categoryData = [
  { name: '食費', amount: 45200, percentage: 36, color: 'bg-blue-500' },
  ...
];
```

プログレスバーの幅は CSS カスタムプロパティ `--progress-width` を利用して `globals.css` 側で設定する（Tailwind の動的クラスを避けるため）。

### MonthlyTrendChart ⚠️ モックデータ

過去 6 ヶ月の収入と支出を縦棒グラフで表示する。

```typescript
// ハードコードされたモックデータ
const monthlyData = [
  { month: '10月', expense: 98000, income: 250000 },
  ...
];
```

**実装の特徴**

- Y 軸ラベルとグリッド線はカスタムプロパティ `--y-label-bottom` を使って CSS 側で `bottom` を設定
- 棒グラフの高さは `--chart-height` を使って CSS 側で `height` を設定
- 定数 `BAR_HEIGHT = 100`、`Y_AXIS_MAX = 350000` でスケール計算

### AssetTrendChart ⚠️ モックデータ

資産推移を SVG の折れ線グラフ（エリアチャート）で表示する。

```typescript
// ハードコードされたモックデータ（2025/4 〜 2026/3 の12ヶ月分）
const assetData = [
  { label: '25/4', asset: 980000 },
  ...
];
```

**SVG 実装の詳細**

| 関数 | 役割 |
|---|---|
| `toAssetX(index, total)` | データインデックス → SVG X 座標 |
| `toAssetY(value)` | 資産額 → SVG Y 座標（SVG は上が 0 のため反転） |
| `buildAssetPolylinePoints(data)` | `<polyline points="...">` の文字列を生成 |
| `buildAssetAreaPath(data)` | `<path d="...">` の SVG パスコマンドを生成（塗りつぶしエリア） |

SVG 定数:
- キャンバスサイズ: 500 × 160
- パディング: 上 20px、右 16px、下 28px、左 44px
- Y 軸範囲: 0 〜 300 万円

---

## 設定タブ（`SettingsTab.tsx`）⚠️ 未実装

「Coming Soon」テキストを表示するプレースホルダーのみ。

**今後実装が必要な内容**

| 機能 | 説明 |
|---|---|
| カテゴリのカスタマイズ | ユーザー固有カテゴリの追加・削除・並び替え |
| CSV エクスポート | 登録データのダウンロード |
| 表示通貨・日付形式の設定 | ローカライゼーション設定 |
| 予算設定 | カテゴリごとの月次予算上限 |
| データ削除 | アカウントデータの全削除 |

---

## 状態管理 ❌ 外部ライブラリなし

Redux・Zustand・Recoil などの外部状態管理ライブラリは使用していない。すべて React 組み込みの `useState` / `useCallback` で管理する。

**データフロー**

```
DashboardPage
  └── activeTab (useState)
      ├── ManualEntryTab
      │     └── entries, selectedDate, showForm ... (useState × 8)
      └── その他タブ（ローカル state なし）
```

各タブは独立した state を持ち、タブ間でデータは共有されない。グラフタブが手動入力タブのデータを参照しないのはこのため。

> **⚠️ 未実装**: 手動入力タブで登録したデータをグラフタブで反映させるには、`entries` state を共通の親（`DashboardPage`）か Context / 状態管理ライブラリに持ち上げる必要がある。

---

## バックエンド / データ永続化 ❌ 未実装

現時点でカスタム API ルートは存在しない（NextAuth のルートを除く）。すべてのデータはブラウザのメモリ上にのみ存在し、ページをリロードすると失われる。

**今後実装が必要な内容**

### データベース層

| 項目 | 候補 |
|---|---|
| DB | PostgreSQL / Amazon DynamoDB |
| ORM | Drizzle ORM / Prisma |
| ホスティング | Vercel Postgres / PlanetScale / AWS RDS |

**想定スキーマ（例）**

```sql
-- ユーザーごとにエントリを保存するテーブル
CREATE TABLE entries (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,        -- Cognito の sub クレーム
  date        DATE NOT NULL,
  type        TEXT NOT NULL,        -- 'expense' | 'income'
  category    TEXT NOT NULL,
  amount      INTEGER NOT NULL,     -- 円
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### API ルート（案）

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/api/entries?month=2026-04` | 月次エントリ一覧取得 |
| `POST` | `/api/entries` | エントリ新規作成 |
| `DELETE` | `/api/entries/[id]` | エントリ削除 |
| `POST` | `/api/receipts` | レシート画像アップロード＋OCR |

Next.js の Server Actions または Route Handlers で実装することを想定。

---

## スタイリング（`app/globals.css`）✅

Tailwind CSS v4（`@import 'tailwindcss'`）を使用。カスタムスタイルは `globals.css` にまとめている。

**CSS カスタムプロパティを使ったチャートスタイル**

Tailwind の動的クラスはパージされるため、数値を伴う動的スタイルは CSS カスタムプロパティ経由で設定する。

```tsx
// コンポーネント側
<div
  className="chart-bar ..."
  style={{ '--chart-height': `${height}px` } as React.CSSProperties}
/>
```

```css
/* globals.css 側 */
.chart-bar {
  height: var(--chart-height);
}
```

同様のパターンが `--progress-width`（カテゴリ別支出バー）、`--y-label-bottom`（Y 軸ラベル位置）にも使われている。

**レイアウト定数**

```css
.dashboard-container {
  max-width: 672px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
```

---

## 未実装機能まとめ

| 機能 | 場所 | 優先度（案） |
|---|---|---|
| データ永続化（DB 接続） | 全体 | 高 |
| グラフと手動入力の連動 | AnalyticsTab | 高 |
| レシート撮影・OCR | ReceiptTab | 中 |
| エントリ編集 | ManualEntryTab | 中 |
| 設定（カテゴリカスタマイズ等） | SettingsTab | 低 |
| CSV エクスポート | SettingsTab | 低 |
| 予算設定・通知 | 未着手 | 低 |
