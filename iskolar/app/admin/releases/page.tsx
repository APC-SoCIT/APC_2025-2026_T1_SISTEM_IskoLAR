"use client";

import { useEffect, useState, useMemo } from 'react';
import BrandedLoader from "@/app/components/ui/BrandedLoader";
import {
  PlusIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import type { Release } from '@/lib/types/release';
import dynamic from 'next/dynamic';

const ScheduleReleaseModal = dynamic(
  () => import('@/app/components/admin/releases/ScheduleReleaseModal'),
  { ssr: false }
);

const DeleteReleaseModal = dynamic(
  () => import('@/app/components/admin/releases/DeleteReleaseModal'),
  { ssr: false }
);

const ArchiveReleaseModal = dynamic(
  () => import('@/app/components/admin/releases/ArchiveReleaseModal'),
  { ssr: false }
);

const FilterModal = dynamic(
  () => import('@/app/components/admin/releases/FilterModal'),
  { ssr: false }
);

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  // Budget state
  const [budget, setBudget] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>("");
  // Calculate total released amount (only for active releases)
  const totalReleased = useMemo(() => {
    return releases
      .filter(r => !r.isArchived) // Only consider non-archived releases
      .reduce((sum, r) => sum + (r.amountperstudent * r.numberofrecipients), 0);
  }, [releases]);

  const remainingBudget = budget - totalReleased;
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    selectedBarangay: '',
    releaseType: ''
  });
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingRelease, setArchivingRelease] = useState<Release | null>(null);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  const fetchReleases = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/releases', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch releases');
      const data = await response.json();
      setReleases(data);
    } catch (error) {
      console.error('Error fetching releases:', error);
      alert('Failed to load releases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const filteredReleases = useMemo(() => {
    return releases
      .filter((release) => {
        const searchMatch = !searchQuery.trim() || [
          release.releasetype,
          release.location,
          release.barangay
        ].some(field => 
          field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

        const barangayMatch = !filters.selectedBarangay || 
          release.barangay?.toLowerCase() === filters.selectedBarangay.toLowerCase();

        const typeMatch = !filters.releaseType || 
          release.releasetype?.toLowerCase() === filters.releaseType.toLowerCase();

        return searchMatch && barangayMatch && typeMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.releasedate}T${a.releasetime}`);
        const dateB = new Date(`${b.releasedate}T${b.releasetime}`);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
  }, [releases, searchQuery, filters.selectedBarangay, filters.releaseType]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    // Filters are automatically applied through useMemo
    setShowFilterModal(false);
  };

  const handleCancel = async (releaseId: number) => {
    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete release');
      await fetchReleases();
    } catch (error) {
      console.error('Error cancelling release:', error);
      alert('Failed to cancel release');
    }
  };

  const handleArchive = async (releaseId: number, archive: boolean) => {
    try {
      const response = await fetch(`/api/releases/${releaseId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: archive })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.error || `Failed to ${archive ? 'archive' : 'unarchive'} release`);
      }

      await fetchReleases();
    } catch (error) {
      console.error('Archive operation failed:', error);
      if (error instanceof Error) {
        alert(`Failed to ${archive ? 'archive' : 'unarchive'} release: ${error.message}`);
      } else {
        alert(`Failed to ${archive ? 'archive' : 'unarchive'} release. Please try again.`);
      }
    }
  };

  // Full page loading state
  if (isLoading && releases.length === 0) {
    return <BrandedLoader title="Loading Releases" subtitle="Loading scholarship disbursements..." />;
  }

  return (
    <div className="px-8 pt-12 pb-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Releases</h1>
          <p className="text-sm text-gray-500 mt-1">Manage scholarship fund releases</p>
        </div>
        <button
          onClick={() => {
            setEditingRelease(null);
            setShowScheduleModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Schedule Release
        </button>
      </div>
      {/* Budget Input Section (moved below title) */}
      <div className="bg-white rounded-xl shadow p-6 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Admin Budget:</h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40"
              placeholder="Enter budget (₱)"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              onClick={() => {
                const val = parseFloat(budgetInput);
                if (!isNaN(val) && val >= 0) setBudget(val);
              }}
            >
              Set Budget
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-500">Total Released</div>
            <div className="mt-1 text-2xl font-semibold text-blue-600">
              {budget > 0 ? (
                `₱${totalReleased.toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2})}`
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-500">Remaining Budget</div>
            <div className={`mt-1 text-2xl font-semibold ${budget === 0 ? 'text-gray-400' : remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {budget > 0 ? (
                `₱${remainingBudget.toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2})}`
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">Available funds</div>
          </div>
        </div>
      </div>
      {/* Search bar in table card header */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-12">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex space-x-1 rounded-lg bg-gray-100 p-0.5">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    activeTab === 'active' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {filteredReleases.filter(r => !r.isArchived).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    activeTab === 'archived' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Archived
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {filteredReleases.filter(r => r.isArchived).length}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
        ) : filteredReleases.filter(r => activeTab === 'active' ? !r.isArchived : r.isArchived).length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab === 'active' ? 'Active' : 'Archived'} Releases</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'active' ? 'Get started by scheduling a new release.' : 'No releases have been archived yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE & TIME</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT PER PERSON (₱)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RECIPIENTS</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReleases
                  .filter(r => activeTab === 'active' ? !r.isArchived : r.isArchived)
                  .map((release) => {
                  // Determine if the release date/time is already past
                  const releaseDateTime = new Date(`${release.releasedate}T${release.releasetime}`);
                  const isPast = new Date() > releaseDateTime;

                  return (
                    <tr key={release.releaseid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 capitalize">{release.releasetype}</div>
                          {isPast && activeTab === 'active' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Done</span>
                          )}
                          {activeTab === 'archived' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Archived</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{release.releasedate}</div>
                        <div className="text-sm text-gray-500">{release.releasetime}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{release.location || '—'}</div>
                        {release.barangay && <div className="text-sm text-gray-500">{release.barangay}</div>}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {release.amountperstudent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{release.numberofrecipients}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-yellow-600 bg-yellow-50 text-xs font-medium rounded hover:bg-yellow-100 transition-colors"
                            onClick={() => {
                              setEditingRelease(release);
                              setShowScheduleModal(true);
                            }}
                          >
                            Edit
                          </button>
                          {activeTab === 'active' ? (
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-gray-600 bg-gray-50 text-xs font-medium rounded hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setArchivingRelease(release);
                                setIsUnarchiving(false);
                                setShowArchiveModal(true);
                              }}
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-blue-600 bg-blue-50 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
                              onClick={() => {
                                setArchivingRelease(release);
                                setIsUnarchiving(true);
                                setShowArchiveModal(true);
                              }}
                            >
                              Unarchive
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-600 bg-red-50 text-xs font-medium rounded hover:bg-red-100 transition-colors"
                            onClick={() => {
                              setSelectedRelease(release);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showScheduleModal && (
        <ScheduleReleaseModal
          onClose={() => {
            setShowScheduleModal(false);
            setEditingRelease(null);
          }}
          release={editingRelease || undefined}
          onSuccess={() => {
            fetchReleases();
            setShowScheduleModal(false);
            setEditingRelease(null);
          }}
        />
      )}

      {showDeleteModal && selectedRelease && (
        <DeleteReleaseModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRelease(null);
          }}
          onConfirm={async () => {
            if (selectedRelease) {
              await handleCancel(selectedRelease.releaseid);
              setShowDeleteModal(false);
              setSelectedRelease(null);
            }
          }}
          release={selectedRelease!}
        />
      )}

      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {showArchiveModal && archivingRelease && (
        <ArchiveReleaseModal
          isOpen={showArchiveModal}
          onClose={() => {
            setShowArchiveModal(false);
            setArchivingRelease(null);
          }}
          onConfirm={async () => {
            if (archivingRelease) {
              await handleArchive(archivingRelease.releaseid, !isUnarchiving);
              setShowArchiveModal(false);
              setArchivingRelease(null);
            }
          }}
          release={archivingRelease}
          isUnarchiving={isUnarchiving}
        />
      )}
    </div>
  );
}