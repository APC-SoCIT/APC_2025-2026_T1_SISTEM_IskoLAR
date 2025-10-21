'use client';

import { useEffect, useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  ExclamationCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  AmountDetailsModal,
  NextReleaseModal,
  PendingReleasesModal,
  RecipientsModal
} from './components/Modals';

type Release = {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  amount: number;
  recipients: number;
  status: 'scheduled' | 'completed' | 'cancelled';
};

type ModalType = 'none' | 'amount' | 'nextRelease' | 'pending' | 'recipients';

export default function ReleasesPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [releaseToCancel, setReleaseToCancel] = useState<Release | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [filters, setFilters] = useState<{
    dateRange: { from: string; to: string; };
    releaseType: 'all' | 'allowance' | 'book' | 'tuition';
  }>({
    dateRange: { from: '', to: '' },
    releaseType: 'all'
  });

  // Example data - in real app, this would come from your API
  const releases: Release[] = [
    {
      id: '1',
      type: 'Allowance Release',
      date: 'Aug 30, 2025',
      time: '9:00 AM',
      location: 'Taguig City Auditorium',
      amount: 5000,
      recipients: 250,
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'Book Allowance',
      date: 'Sep 15, 2025',
      time: '10:00 AM',
      location: 'APC Library',
      amount: 3000,
      recipients: 200,
      status: 'scheduled'
    }
  ];

  const pastReleases: Release[] = [
    {
      id: '3',
      type: 'Tuition Subsidy',
      date: 'Jul 15, 2025',
      time: '9:00 AM',
      location: 'Online Transfer',
      amount: 15000,
      recipients: 180,
      status: 'completed'
    }
  ];

  const handleScheduleRelease = () => {
    setShowScheduleModal(true);
  };

  const filteredReleases = (activeTab === 'upcoming' ? releases : pastReleases)
    .filter(release => {
      // Filter by release type
      const matchesType = filters.releaseType === 'all' || 
        release.type.toLowerCase().includes(filters.releaseType);

      // Filter by date range
      let matchesDate = true;
      if (filters.dateRange.from && filters.dateRange.to) {
        const releaseDate = new Date(release.date);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        matchesDate = releaseDate >= fromDate && releaseDate <= toDate;
      }

      return matchesType && matchesDate;
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleBulkAction(_arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Scholarship Releases</h1>
        <p className="text-gray-600 mt-1">Manage and schedule scholarship fund releases</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Amount Card - Most important financial metric */}
        <button 
          onClick={() => setActiveModal('amount')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Release Amount</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₱2.5M</p>
              <p className="text-sm text-gray-600 mt-1">1st Semester, AY 2025-2026</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
            <span className="text-gray-600">Next release: Oct 25, 2025</span>
          </div>
        </button>

        {/* Next Release Card - Immediate action item */}
        <button
          onClick={() => setActiveModal('nextRelease')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Next Release</p>
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">Oct 25, 2025</p>
                <p className="text-sm font-medium text-blue-600 mt-1">In 3 days</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Allowance Release</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>9:00 AM at Main Auditorium</span>
          </div>
        </button>

        {/* Pending Releases Card - Workload indicator */}
        <button
          onClick={() => setActiveModal('pending')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Releases</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600 ml-2">scheduled</p>
              </div>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                <p className="text-sm text-gray-600">All on track</p>
              </div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium">Next 30 days:</span>
            <span className="text-gray-500 ml-2">3 Allowance, 2 Book</span>
          </div>
        </button>

        {/* Total Recipients Card - Impact metric */}
        <button
          onClick={() => setActiveModal('recipients')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Recipients</p>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">1,250</p>
                <p className="text-sm text-gray-600 mt-1">Current semester</p>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Allowance:</span>
              <span className="ml-1 font-medium">850</span>
            </div>
            <div>
              <span className="text-gray-500">Book:</span>
              <span className="ml-1 font-medium">400</span>
            </div>
          </div>
        </button>
      </div>

      {/* Releases List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Releases</h2>
              <span className="px-2.5 py-0.5 text-sm bg-blue-100 text-blue-600 rounded-full">
                {filteredReleases.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
                {(filters.releaseType !== 'all' || filters.dateRange.from || filters.dateRange.to) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={handleScheduleRelease}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Schedule Release
              </button>
            </div>
          </div>
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Releases
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Releases
            </button>
          </nav>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
          ) : filteredReleases.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Releases Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'upcoming' 
                  ? 'No upcoming releases scheduled. Click "Schedule Release" to create one.'
                  : 'No past releases found in the selected time period.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{release.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{release.date}</div>
                      <div className="text-sm text-gray-500">{release.time}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{release.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">₱{release.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per student</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                      {release.recipients} students
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${release.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                          release.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="cursor-pointer text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md"
                        onClick={() => {
                          setEditingRelease(release);
                          setShowScheduleModal(true);
                        }}
                      >
                        Edit
                      </button>
                      {release.status === 'scheduled' && (
                        <button 
                          className="cursor-pointer text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
                          onClick={() => {
                            setReleaseToCancel(release);
                            setIsConfirmOpen(true);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Release Modal */}
      {showScheduleModal && (
        <ScheduleReleaseModal 
          onClose={() => {
            setShowScheduleModal(false);
            setEditingRelease(null);
          }} 
          release={editingRelease}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && releaseToCancel && (
        <CancelConfirmationModal 
          isOpen={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setReleaseToCancel(null);
          }}
          onConfirm={() => {
            // TODO: Add API call to cancel release
            console.log('Canceling release:', releaseToCancel.id);
            setIsConfirmOpen(false);
            setReleaseToCancel(null);
          }}
          release={releaseToCancel}
        />
      )}

      {/* Modal Components */}
      {activeModal === 'amount' && (
        <AmountDetailsModal setActiveModal={setActiveModal} />
      )}
      {activeModal === 'nextRelease' && (
        <NextReleaseModal setActiveModal={setActiveModal} />
      )}
      {activeModal === 'pending' && (
        <PendingReleasesModal setActiveModal={setActiveModal} />
      )}
      {activeModal === 'recipients' && (
        <RecipientsModal setActiveModal={setActiveModal} />
      )}

      {/* Filter Modal */}
      <ReleasesFilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterModalOpen(false);
        }}
        onReset={() => {
          setFilters({
            dateRange: { from: '', to: '' },
            releaseType: 'all'
          });
          setIsFilterModalOpen(false);
        }}
        initialFilters={filters}
      />
    </div>
  );
}

// Filter Modal Component
interface ReleasesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    dateRange: { from: string; to: string };
    releaseType: 'all' | 'allowance' | 'book' | 'tuition';
  }) => void;
  onReset: () => void;
  initialFilters: {
    dateRange: { from: string; to: string };
    releaseType: 'all' | 'allowance' | 'book' | 'tuition';
  };
}

function ReleasesFilterModal({ isOpen, onClose, onApply, onReset, initialFilters }: ReleasesFilterModalProps) {
  const [dateRange, setDateRange] = useState(initialFilters.dateRange);
  const [releaseType, setReleaseType] = useState(initialFilters.releaseType);

  useEffect(() => {
    setDateRange(initialFilters.dateRange);
    setReleaseType(initialFilters.releaseType);
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply({ dateRange, releaseType });
  };

  const handleDateShortcut = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Filter Releases</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Release Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-100">
              <button 
                onClick={() => handleDateShortcut(7)} 
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Last 7 days
              </button>
              <span className="text-gray-300 self-center">•</span>
              <button 
                onClick={() => handleDateShortcut(30)} 
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Last 30 days
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Release Type</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="releaseType" 
                  value="all" 
                  checked={releaseType === 'all'} 
                  onChange={(e) => setReleaseType(e.target.value as 'all' | 'allowance' | 'book' | 'tuition')} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">All Releases</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="releaseType" 
                  value="allowance" 
                  checked={releaseType === 'allowance'} 
                  onChange={(e) => setReleaseType(e.target.value as 'all' | 'allowance' | 'book' | 'tuition')} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Allowance Releases</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="releaseType" 
                  value="book" 
                  checked={releaseType === 'book'} 
                  onChange={(e) => setReleaseType(e.target.value as 'all' | 'allowance' | 'book' | 'tuition')} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Book Allowances</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="releaseType" 
                  value="tuition" 
                  checked={releaseType === 'tuition'} 
                  onChange={(e) => setReleaseType(e.target.value as 'all' | 'allowance' | 'book' | 'tuition')} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Tuition Subsidies</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            onClick={onReset} 
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply} 
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// Schedule Release Modal Component
interface ScheduleReleaseModalProps {
  onClose: () => void;
  release?: Release | null;
}

function ScheduleReleaseModal({ onClose, release }: ScheduleReleaseModalProps) {
  const [formData, setFormData] = useState({
    type: release?.type.toLowerCase().includes('allowance') ? 'allowance' : 
          release?.type.toLowerCase().includes('book') ? 'book' : 
          release?.type.toLowerCase().includes('tuition') ? 'tuition' : 'allowance',
    date: release?.date || new Date().toISOString().split('T')[0],
    time: release?.time || '09:00',
    location: release?.location || '',
    amount: release?.amount?.toString() || '',
    recipients: release?.recipients?.toString() || '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // TODO: Add API call to save release
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Schedule New Release</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">Release Type</label>
            <select 
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="allowance">Allowance Release</option>
              <option value="book">Book Allowance</option>
              <option value="tuition">Tuition Subsidy</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">Release Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-2">Release Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter release location"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">Amount per Student</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₱</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter the amount each student will receive</p>
          </div>

          <div>
            <label htmlFor="recipients" className="block text-sm font-semibold text-gray-700 mb-2">Number of Recipients</label>
            <input
              type="number"
              id="recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              placeholder="Enter the number of recipients"
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Total amount: ₱{formData.amount && formData.recipients ? 
              (parseFloat(formData.amount) * parseInt(formData.recipients)).toLocaleString() : '0.00'}</p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add any additional notes or instructions..."
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {release ? 'Save' : 'Schedule Release'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Cancel Confirmation Modal Component
interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  release: Release;
}

function CancelConfirmationModal({ isOpen, onClose, onConfirm, release }: CancelConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">Cancel Release</h2>
          <p className="mt-3 text-sm text-gray-600">
            Are you sure you want to cancel this release? This action cannot be undone.
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-center gap-3 text-sm text-yellow-800">
              <div className="font-medium">{release.type}</div>
              <span>•</span>
              <div>{release.date}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Keep Release
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Cancel Release
          </button>
        </div>
      </div>
    </div>
  );
}
