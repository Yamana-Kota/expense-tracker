import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const totalExpense = 127420;
const totalIncome = 250000;
const balance = totalIncome - totalExpense;

/**
 * 収支サマリーカードコンポーネント
 *
 * 今月の支出・収入・収支差額を3枚のカードで横並びに表示する。
 * 収支がプラスのときは緑、マイナスのときは赤でカードの背景色を変える。
 */
export default function SummaryCards() {
  return (
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
  );
}
