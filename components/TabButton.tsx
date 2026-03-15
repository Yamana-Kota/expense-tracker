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
