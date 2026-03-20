'use client';

import { useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';

type TabButtonProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onSelect: (id: string) => void;
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
  icon: Icon,
  isActive,
  onSelect,
}: TabButtonProps) {
  const handleClick = useCallback(() => onSelect(id), [id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`tab-nav__button ${isActive ? 'tab-nav__button--active' : 'tab-nav__button--inactive'}`}
    >
      <Icon className="tab-nav__icon" />
      <span>{label}</span>
    </button>
  );
}

export default TabButton;
