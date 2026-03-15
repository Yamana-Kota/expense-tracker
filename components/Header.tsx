import Link from 'next/link';
import { LogOut, Receipt } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* アプリ名 */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Receipt className="h-7 w-7 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Auto Expense
            </h1>
          </Link>

          {/* ログアウトボタン */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">ログアウト</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
