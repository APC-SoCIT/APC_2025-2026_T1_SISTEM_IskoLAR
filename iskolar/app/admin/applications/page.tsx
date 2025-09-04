'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import AdminTopNav from '../components/AdminTopNav';

type Status = 'Pending' | 'Approved' | 'Rejected';

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  icon: ReactNode;
}

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  schoolType: 'Public' | 'Private';
  barangay: string;
  status: Status;
  date: string;
  action: string;
}

const applicantsData: Applicant[] = [
  {
    id: '2025-0001',
    name: 'Maria Santos',
    avatar: '/avatars/maria.jpg',
    schoolType: 'Public',
    barangay: 'Bagumbayan',
    status: 'Pending',
    date: 'Aug 15, 2025',
    action: 'Review'
  },
  {
    id: '2025-0002',
    name: 'Juan Dela Cruz',
    avatar: '/avatars/juan.jpg',
    schoolType: 'Private',
    barangay: 'Western Bicutan',
    status: 'Approved',
    date: 'Aug 14, 2025',
    action: 'View'
  },
  {
    id: '2025-0003',
    name: 'Sophia Reyes',
    avatar: '/avatars/sophia.jpg',
    schoolType: 'Private',
    barangay: 'Bambang',
    status: 'Rejected',
    date: 'Aug 13, 2025',
    action: 'View'
  },
  {
    id: '2025-0004',
    name: 'Miguel Bautista',
    avatar: '/avatars/miguel.jpg',
    schoolType: 'Public',
    barangay: 'South Signal Village',
    status: 'Approved',
    date: 'Aug 12, 2025',
    action: 'View'
  },
];

const StatusPill = ({ status }: { status: Status }) => {
  const statusConfigs: Record<Status, StatusConfig> = {
    Pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: (
        <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    Approved: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    Rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: (
        <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const config = statusConfigs[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     ${config.bg} ${config.text} border ${config.border}
                     transition-all duration-150 group-hover:shadow-sm`}>
      {config.icon}
      {status}
    </span>
  );


};

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <AdminTopNav />
      
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              IskoLAR Applicants List
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              List of all the scholars application
            </p>
          </div>
        </div>

        {/* Applications Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Scholarship Applications
                </h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                  {applicantsData.length} total
                </span>
              </div>
              <Link
                href="/admin/applications/all"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 
                         hover:text-blue-700 transition-colors duration-200"
              >
                View all
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    School Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Barangay
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicantsData.map((applicant) => (
                  <tr 
                    key={applicant.id} 
                    className="group transition-colors duration-150 hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white shadow-sm
                                      flex items-center justify-center transition-transform duration-200
                                      group-hover:scale-110">
                            <span className="text-blue-600 font-medium text-sm">
                              {applicant.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
                            {applicant.name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {applicant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {applicant.schoolType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {applicant.barangay}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPill status={applicant.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {applicant.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/applications/${applicant.id}`}
                        className="inline-flex items-center text-sm font-medium text-blue-600 
                                hover:text-blue-700 transition-colors duration-150"
                      >
                        {applicant.action}
                        <svg 
                          className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 
                                  group-hover:translate-x-0 transition-all duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
