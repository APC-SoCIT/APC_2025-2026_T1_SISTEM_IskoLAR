'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import OverviewTab from './components/OverviewTab';
import ApplicationNavbar from './components/ApplicationNavbar';

// Mock data for the application
const applicationData: any = {
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
    summary: 'A dedicated student with exceptional academic performance and active community involvement. Currently maintains a high GPA while participating in various extracurricular activities and community service programs.'
  },
  verification: {
    residency: { status: 'verified', icon: '✅' },
    voterStatus: { status: 'verified', icon: '✅' },
    documents: { status: 'reupload', icon: '⚠️' }
  },
  timeline: [
    {
      title: 'Application Submitted',
      date: 'Aug 15, 2025 9:30 AM',
      status: 'complete' as const,
      description: 'Application received with all initial documents'
    },
    {
      title: 'Assigned Reviewer',
      date: 'Aug 16, 2025 10:15 AM',
      status: 'complete' as const,
      description: 'Application assigned to Admin User'
    },
    {
      title: 'Re-upload Requested',
      date: 'Aug 17, 2025 2:45 PM',
      status: 'current' as const,
      description: 'Requested clearer copy of birth certificate'
    },
    {
      title: 'Final Decision',
      date: 'Pending',
      status: 'pending' as const,
      description: 'Awaiting final review and decision'
    }
  ] as const
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
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

export default function ApplicationReviewPage() {
  const [comment, setComment] = useState('');
  return <OverviewTab applicationData={applicationData} comment={comment} setComment={setComment} />;
}
