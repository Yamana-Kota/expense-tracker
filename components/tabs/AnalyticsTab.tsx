'use client';

import AssetTrendChart from '@/components/tabs/analytics/AssetTrendChart';
import CategoryExpenseChart from '@/components/tabs/analytics/CategoryExpenseChart';
import MonthlyTrendChart from '@/components/tabs/analytics/MonthlyTrendChart';
import SummaryCards from '@/components/tabs/analytics/SummaryCards';

/**
 * 分析タブのコンテナコンポーネント
 *
 * サマリーカード・カテゴリ別支出・月別推移・資産推移の4つのグラフをまとめて表示する。
 */
export default function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <SummaryCards />
      <CategoryExpenseChart />
      <MonthlyTrendChart />
      <AssetTrendChart />
    </div>
  );
}
