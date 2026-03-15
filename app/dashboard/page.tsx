// 'use client' は Next.js App Router のディレクティブ（ファイル先頭に書く特別な指示文）。
// このファイルがブラウザ側（クライアント）で実行されることを宣言する。
// これがないと、useState などのブラウザ専用 API が使えない。
'use client';

// React の組み込みフックをインポート。
// useState  ... コンポーネントの状態（変数）を管理する
// useCallback ... 関数をメモ化してパフォーマンスを最適化する
import { useState, useCallback } from 'react';

// lucide-react はアイコンライブラリ。SVG アイコンを React コンポーネントとして提供する。
import { Camera, PenLine, BarChart3, Settings } from 'lucide-react';

// '@/' は tsconfig.json で設定されたパスエイリアスで、プロジェクトルートを指す。
// 相対パスの代わりに '@/components/...' と書ける。
import TabButton from '@/components/TabButton';
import ReceiptTab from '@/components/tabs/ReceiptTab';
import ManualEntryTab from '@/components/tabs/ManualEntryTab';
import AnalyticsTab from '@/components/tabs/AnalyticsTab';
import SettingsTab from '@/components/tabs/SettingsTab';

// TypeScript の「ユニオン型（Union Type）」。
// Tab 型は 'receipt' | 'manual' | 'analytics' | 'settings' のいずれかの文字列のみを許可する。
// これにより、タイプミスや不正な値をコンパイル時に検出できる。
type Tab = 'receipt' | 'manual' | 'analytics' | 'settings';

// タブの定義をデータとして配列で管理する。
// コンポーネント外に置くことで、再レンダリングのたびに再生成されない。
// 各要素の型は TypeScript が自動推論するが、
// 'receipt' などの文字列リテラルは string に広がらないよう `as Tab` で明示的にキャストしている。
const tabs = [
  { id: 'receipt' as Tab, label: 'レシート登録', icon: Camera },
  { id: 'manual' as Tab, label: '手動登録', icon: PenLine },
  { id: 'analytics' as Tab, label: 'グラフ', icon: BarChart3 },
  { id: 'settings' as Tab, label: '設定', icon: Settings },
];

/**
 * ダッシュボードのメインページ
 *
 * タブナビゲーションと各タブのコンテンツを管理する。
 * 選択中のタブを state で保持し、対応するタブコンポーネントを条件付きレンダリングする。
 */
export default function DashboardPage() {
  // useState<Tab>('receipt') の意味：
  //   - <Tab> ... この state は Tab 型しか入れられない（型引数）
  //   - ('receipt') ... 初期値は 'receipt'
  //   - 戻り値は [現在の値, 値を更新する関数] のタプル（配列の分割代入）
  const [activeTab, setActiveTab] = useState<Tab>('receipt');

  // useCallback でイベントハンドラをメモ化する。
  // メモ化とは「同じ関数オブジェクトを再利用する」こと。
  // 第2引数 [] は「依存配列」。空なので初回レンダリング時だけ関数を生成し、以後は同じ関数を返す。
  // これにより TabButton への props が変わらず、不要な子コンポーネントの再レンダリングを防ぐ。
  const handleTabSelect = useCallback((id: string) => {
    // id は string 型だが setActiveTab は Tab 型を要求するため、`as Tab` でキャストする。
    // tabs 配列から来る値しか渡さないので安全。
    setActiveTab(id as Tab);
  }, []); // 依存配列が空 = このコールバックは再生成されない

  // コンポーネントが返す JSX（見た目の定義）。
  // JSX は JavaScript の中に HTML っぽい構文を書ける React の記法。
  // 最終的に React.createElement() の呼び出しに変換される。
  return (
    // className は HTML の class 属性に対応する（JSX では class が予約語のため className を使う）。
    // Tailwind CSS のユーティリティクラスでスタイルを当てている。
    <div className="dashboard-container">
      {/* JSX 内のコメントはこの形式で書く */}
      {/* タブナビゲーション */}
      <div className="tab-nav">
        {/* Array.map() で配列をループして JSX の配列を生成する。
            React はこれを受け取って DOM を構築する。
            { id, label, icon } はオブジェクトの「分割代入（Destructuring）」。
            tabs の各要素から必要なプロパティだけ取り出している。 */}
        {tabs.map(({ id, label, icon }) => (
          <TabButton
            // key は React がリスト内の要素を識別するために必要な特別な props。
            // ユニークな値（ここでは id）を渡す。key が変わると要素が再作成される。
            key={id}
            id={id}
            label={label}
            icon={icon}
            // activeTab === id は真偽値（boolean）。
            // 現在のタブと一致していれば true、そうでなければ false。
            isActive={activeTab === id}
            onSelect={handleTabSelect}
          />
        ))}
      </div>

      {/* 条件付きレンダリング：`&&` 演算子を使う。
          JavaScript では `true && <Component />` は <Component /> を返す。
          `false && <Component />` は false を返し、React は何も描画しない。
          これにより「activeTab が 'receipt' のときだけ ReceiptTab を表示」できる。 */}
      {activeTab === 'receipt' && <ReceiptTab />}
      {activeTab === 'manual' && <ManualEntryTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
