'use client';

import { useState, useCallback } from 'react';
import { Camera, PenLine, BarChart3, Settings } from 'lucide-react';
import TabButton from '@/components/TabButton';
import ReceiptTab from '@/components/tabs/ReceiptTab';
import ManualEntryTab from '@/components/tabs/ManualEntryTab';
import AnalyticsTab from '@/components/tabs/AnalyticsTab';
import SettingsTab from '@/components/tabs/SettingsTab';

type Tab = 'receipt' | 'manual' | 'analytics' | 'settings';

const tabs = [
  { id: 'receipt' as Tab, label: 'レシート登録', icon: Camera },
  { id: 'manual' as Tab, label: '手動登録', icon: PenLine },
  { id: 'analytics' as Tab, label: 'グラフ', icon: BarChart3 },
  { id: 'settings' as Tab, label: '設定', icon: Settings },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('receipt');

  const handleTabSelect = useCallback((id: string) => {
    setActiveTab(id as Tab);
  }, []);

  return (
    <div className="dashboard-container">
      {/* タブナビゲーション */}
      <div className="tab-nav">
        {tabs.map(({ id, label, icon }) => (
          <TabButton
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={activeTab === id}
            onSelect={handleTabSelect}
          />
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'receipt' && <ReceiptTab />}
      {activeTab === 'manual' && <ManualEntryTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
