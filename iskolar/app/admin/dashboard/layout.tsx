'use client';

import DashboardTopNav from '../components/DashboardTopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Top Navigation */}
      <DashboardTopNav />
      {/* Main Content */}
      {children}
    </div>
  );
}
