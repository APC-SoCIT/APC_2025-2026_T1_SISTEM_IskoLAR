'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

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

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}
                     transition-all duration-150 group-hover:shadow-sm`}>
      {statusConfig.icon}
      {status}
    </span>
  );
};

export default function ApplicationsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        {/* Left side - Title and Description */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            IskoLAR Applicants List
          </h1>
          <p className="text-sm text-gray-500">
            List of all the scholars application
          </p>
        </div>

        {/* Right side - Search, Notifications, and Profile */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search applicants..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 
                       text-sm transition-all duration-200
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       focus:bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400 transition-colors duration-200" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          {/* Admin Profile with Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 group">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Admin User</span>
                <span className="text-xs text-gray-500">administrator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  AU
                </div>
                <svg 
                  className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 invisible opacity-0 translate-y-1 
                          transition-all duration-200 ease-in-out z-50
                          group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  onClick={() => {/* Add logout logic */}}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Scholarship Applications
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
  );
}
