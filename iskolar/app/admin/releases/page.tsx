'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PlusIcon,
  FunnelIcon,
  ChevronDownIcon,
  ExclamationCircleIcon
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
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<ModalType>('none');

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

  const handleBulkAction = (action: string) => {
    // Handle bulk actions here
    console.log(`Action: ${action}, Selected: ${selectedReleases.join(', ')}`);
  };

  const filteredReleases = (activeTab === 'upcoming' ? releases : pastReleases)
    .filter(release => filterType === 'all' || release.type.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Scholarship Releases</h1>
          <p className="text-gray-600 mt-1">Manage and schedule scholarship fund releases</p>
        </div>
        <button 
          onClick={handleScheduleRelease}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Schedule Release
        </button>
      </div>

      {/* Filter and Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="allowance">Allowance</option>
              <option value="book">Book Allowance</option>
              <option value="tuition">Tuition Subsidy</option>
            </select>
            <FunnelIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        {selectedReleases.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{selectedReleases.length} selected</span>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cancel Selected
            </button>
          </div>
        )}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
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

      {/* Releases List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading releases...</p>
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="p-8 text-center">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No releases found</h3>
              <p className="mt-2 text-gray-600">
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
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onChange={(e) => {
                        setSelectedReleases(
                          e.target.checked 
                            ? filteredReleases.map(r => r.id)
                            : []
                        );
                      }}
                      checked={selectedReleases.length === filteredReleases.length && filteredReleases.length > 0}
                    />
                  </th>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedReleases.includes(release.id)}
                        onChange={(e) => {
                          setSelectedReleases(
                            e.target.checked
                              ? [...selectedReleases, release.id]
                              : selectedReleases.filter(id => id !== release.id)
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{release.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{release.date}</div>
                      <div className="text-sm text-gray-500">{release.time}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{release.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₱{release.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per student</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {release.recipients} students
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${release.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                          release.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => console.log('Edit release:', release.id)}
                      >
                        Edit
                      </button>
                      {release.status === 'scheduled' && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleBulkAction('cancel')}
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
        <div className="fixed inset-0 z-50">
          {/* Blurred background overlay */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-gray-500/30"
            onClick={() => setShowScheduleModal(false)}
          />
          
          {/* Modal content */}
          <div className="relative z-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Schedule New Release</h3>
                  <p className="mt-1 text-sm text-gray-500">Fill in the details to schedule a new scholarship release</p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                {/* Release Type */}
                <div>
                  <label htmlFor="releaseType" className="block text-sm font-medium text-gray-700">
                    Release Type
                  </label>
                  <select
                    id="releaseType"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="allowance">Allowance Release</option>
                    <option value="book">Book Allowance</option>
                    <option value="tuition">Tuition Subsidy</option>
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">
                      Release Date
                    </label>
                    <input
                      type="date"
                      id="releaseDate"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="releaseTime" className="block text-sm font-medium text-gray-700">
                      Release Time
                    </label>
                    <input
                      type="time"
                      id="releaseTime"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount per Student
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₱</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      className="pl-7 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
                    Number of Recipients
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="recipients"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter number of recipients"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any additional information..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Schedule Release
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
    </div>
  );
}
