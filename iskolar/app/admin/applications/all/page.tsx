'use client';

import React from 'react';
import Link from 'next/link';
import FilterModal from '../components/FilterModal';
import AdminTopNav from '../../components/AdminTopNav';

type Status = 'Pending' | 'Approved' | 'Rejected';

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

// Expanded mock data for full list
const allApplicantsData: Applicant[] = [
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
  // Add more mock data here...
];

const StatusPill = ({ status }: { status: Status }) => {
  const styles = {
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

  const config = styles[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     ${config.bg} ${config.text} border ${config.border}
                     transition-all duration-150 group-hover:shadow-sm`}>
      {config.icon}
      {status}
    </span>
  );
};

export default function AllApplicationsPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<any>(null);
  const [applicants, setApplicants] = React.useState(allApplicantsData);

  // Calculate counts for filter modal
  const counts = {
    pending: applicants.filter(a => a.status === 'Pending').length,
    approved: applicants.filter(a => a.status === 'Approved').length,
    rejected: applicants.filter(a => a.status === 'Rejected').length,
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to the data
    let filtered = [...allApplicantsData];
    
    if (newFilters.searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(newFilters.searchQuery.toLowerCase())
      );
    }

    if (newFilters.selectedStatuses.length > 0) {
      filtered = filtered.filter(a => newFilters.selectedStatuses.includes(a.status));
    }

    if (newFilters.selectedSchoolType) {
      filtered = filtered.filter(a => a.schoolType === newFilters.selectedSchoolType);
    }

    if (newFilters.selectedBarangay) {
      filtered = filtered.filter(a => a.barangay === newFilters.selectedBarangay);
    }

    if (newFilters.dateRange.from && newFilters.dateRange.to) {
      const from = new Date(newFilters.dateRange.from);
      const to = new Date(newFilters.dateRange.to);
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return date >= from && date <= to;
      });
    }

    setApplicants(filtered);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(null);
    setApplicants(allApplicantsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopNav />
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Scholarship Applications</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all scholarship applications
              </p>
            </div>
          </div>        {/* Filter Button */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transition-colors duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
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
              {applicants.map((applicant) => (
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        counts={counts}
      />
      </div>
    </div>
  );
}
