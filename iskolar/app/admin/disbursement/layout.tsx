'use client';

import DisbursementScheduleTopNav from '../components/DisbursementScheduleTopNav';

export default function DisbursementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disbursement Schedule Top Navigation */}
      <DisbursementScheduleTopNav />
      
      {/* Main Content */}
      {children}
    </div>
  );
}
