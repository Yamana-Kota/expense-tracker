'use client';

import { useCallback } from 'react';
// `import type` で型だけをインポートする。LucideIcon はアイコンコンポーネントの型。
// lucide-react のすべてのアイコン（Camera, PenLine など）はこの型を共通で持つ。
// 型として扱うことで「どのアイコンでも受け取れる汎用的な props」を表現できる。
import type { LucideIcon } from 'lucide-react';

// タブボタンの props（プロパティ）を型で定義する。
type TabButtonProps = {
  id: string; // タブの識別子（例: 'receipt', 'manual'）
  label: string; // ボタンに表示するテキスト
  icon: LucideIcon; // lucide-react のアイコンコンポーネント（関数の型）
  isActive: boolean; // このタブが現在選択中かどうか
  onSelect: (id: string) => void; // タブが選択されたときに呼ばれるコールバック関数の型
};

/**
 * ナビゲーションタブの1つのボタン
 *
 * アイコンとラベルを縦に並べ、アクティブ状態でスタイルを変える。
 *
 * @param id - タブの識別子
 * @param label - 表示ラベル
 * @param icon - lucide-react のアイコンコンポーネント
 * @param isActive - アクティブ状態フラグ
 * @param onSelect - 選択時コールバック
 */
function TabButton({
  id,
  label,
  // `icon: Icon` は「icon というプロパティを受け取り、コンポーネント内では Icon という名前で使う」という意味。
  // 小文字始まりの `icon` のままでは JSX でコンポーネントとして使えない
  //（React は小文字始まりの名前を HTML タグとして扱うため）。
  // 大文字始まりの `Icon` に改名することで <Icon /> と書ける。
  icon: Icon,
  isActive,
  onSelect,
}: TabButtonProps) {
  // useCallback でクリックハンドラをメモ化する。
  // 依存配列 [id, onSelect] に指定した値が変わった場合だけ関数を再生成する。
  // id や onSelect が変わらなければ同じ関数参照を返し続けるため、
  // 親コンポーネントの再レンダリング時に TabButton が不要に再レンダリングされない。
  const handleClick = useCallback(() => onSelect(id), [id, onSelect]);

  return (
    <button
      onClick={handleClick}
      // テンプレートリテラルでベースクラスと状態クラスを組み合わせる。
      // isActive が true なら --active クラス、false なら --inactive クラスを付ける。
      // BEM（Block__Element--Modifier）という CSS 命名規則を使っている。
      className={`tab-nav__button ${isActive ? 'tab-nav__button--active' : 'tab-nav__button--inactive'}`}
    >
      {/* Icon は LucideIcon 型のコンポーネント。props として className を渡せる。
          tab-nav__icon は globals.css で定義されたカスタムクラス。 */}
      <Icon className="tab-nav__icon" />
      <span>{label}</span>
    </button>
  );
}

// `export default` でこのコンポーネントをデフォルトエクスポートする。
// ファイルの末尾でエクスポートするスタイルは、
// コンポーネント定義とエクスポートを分離して読みやすくする慣習。
export default TabButton;
