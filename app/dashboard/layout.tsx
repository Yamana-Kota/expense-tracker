import Header from '@/components/Header';

/**
 * ダッシュボード配下のページ全体を包むレイアウト
 *
 * @param children - Next.js が自動で渡す、現在のページのコンポーネント。
 *   コンポーネントタグの「中身」を受け取る特別なプロパティ。
 *   `React.ReactNode` は JSX・文字列・数値・null など描画できるもの全般の型。
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
}
