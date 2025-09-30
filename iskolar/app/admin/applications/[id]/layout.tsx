'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import ApplicationNavbar from './components/ApplicationNavbar';
import DetailNavbar from '../components/DetailNavbar';
import AdminTopNav from '../../components/AdminTopNav';

// Shared mock data
export type Applicant = {
  name: string;
  program: string;
  school: string;
  course: string;
  gpa: string;
  barangay: string;
  submissionDate: string;
  contactNumber: string;
  summary: string;
};

export type ApplicationData = {
  id: string;
  status: 'Pending' | 'Approved' | 'Denied';
  applicant: Applicant;
};

export const applicationData: ApplicationData = {
  id: 'ISKOLAR-2025-001',
  status: 'Pending',
  applicant: {
    name: 'Juan Dela Cruz',
    program: 'Premier Scholarship',
    school: 'DLSU',
    course: 'BSCS',
    gpa: '3.8',
    barangay: 'Barangay 123',
    submissionDate: 'Aug 15, 2025',
    contactNumber: '+63 912 345 6789',
    summary: 'A dedicated student with exceptional academic performance and active community involvement.'
  }
} as const;

// Status Badge Component
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Approved': 'bg-green-50 text-green-700 border-green-200',
    'Denied': 'bg-red-50 text-red-700 border-red-200',
  }[status] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles}`}>
      {status}
    </span>
  );
};

interface LayoutProps {
  children: ReactNode;
}

export default function ApplicationLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Top Navigation */}
      <AdminTopNav />

      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Page Navigation */}
        <DetailNavbar title="Application Review" showBackButton={true} />
        
        {/* Application Details Card */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Application Details
              </h2>
              <div className="flex items-center gap-4">
                <StatusBadge status={applicationData.status} />
                <span className="text-sm text-gray-500 font-medium">
                  {applicationData.id}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <ApplicationNavbar />
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
