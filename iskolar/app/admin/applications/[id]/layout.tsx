'use client';

import React from 'react';
import ApplicationNavbar from './components/ApplicationNavbar';

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
};

// Status Badge Component
export const StatusBadge = ({ status }: { status: string }) => {
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

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Application Details Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => window.history.back()} 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Application Review</h1>
            </div>
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

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
