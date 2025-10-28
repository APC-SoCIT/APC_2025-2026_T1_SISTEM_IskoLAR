"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BrandedLoader from "@/app/components/ui/BrandedLoader";
import { XMarkIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon, UserIcon, ArrowLeftIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
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

// --- TYPE DEFINITIONS ---
type Application = {
  application_id: string;
  semester_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  first_name: string;
  last_name: string;
  barangay: string;
  school: string;
  email_address: string;
};

interface ApplicationFilters {
  dateRange: { from: string; to: string; };
  status: 'pending' | 'approved' | 'rejected' | 'all';
}
// --- END TYPE DEFINITIONS ---


export default function SemesterApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const schoolYearId = params.id as string;
  const semesterId = params.semesterID as string;
  
  console.log('🔧 Page Parameters (DETAILED):', { 
    schoolYearId, 
    semesterId,
    semesterIdType: typeof semesterId,
    semesterIdLength: semesterId?.length,
    rawParams: params 
  });
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ApplicationFilters>({ dateRange: { from: '', to: '' }, status: 'all' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Releases state
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoadingReleases, setIsLoadingReleases] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [budget, setBudget] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingRelease, setArchivingRelease] = useState<Release | null>(null);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // Calculate total released amount (only for active releases)
  const totalReleased = useMemo(() => {
    return releases
      .filter(r => !r.isArchived)
      .reduce((sum, r) => sum + (r.amountperstudent * r.numberofrecipients), 0);
  }, [releases]);

  const remainingBudget = budget - totalReleased;

  const fetchApplications = useCallback(async () => { 
    setIsLoading(true); 
    try { 
      console.log('🔍 Fetching applications for semester:', semesterId);
      console.log('📍 API URL:', `/api/admin/applications?semesterId=${semesterId}`);
      
      const response = await fetch(`/api/admin/applications?semesterId=${semesterId}`);
      const data = await response.json();
      
      console.log('📊 API Response status:', response.status);
      console.log('📦 API Response data:', data);
      console.log('📈 Number of applications:', Array.isArray(data) ? data.length : 0);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('🔍 First application details:', {
          application_id: data[0].application_id,
          user_id: data[0].user_id,
          first_name: data[0].first_name,
          last_name: data[0].last_name,
          email: data[0].email_address,
          barangay: data[0].barangay,
          school: data[0].school,
          status: data[0].status
        });
      }
      
      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to fetch applications';
        console.error('❌ API Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (Array.isArray(data)) {
        console.log('✅ Successfully fetched', data.length, 'applications');
        setApplications(data); 
      } else {
        console.warn('⚠️ Expected array but got:', typeof data);
        setApplications([]);
      }
    } catch (error) { 
      console.error('💥 Error fetching applications:', error); 
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to fetch applications', 
        type: 'error' 
      }); 
      setApplications([]);
    } finally { 
      setIsLoading(false); 
    } 
  }, [semesterId]);

  const fetchReleases = useCallback(async () => {
    try {
      setIsLoadingReleases(true);
      const response = await fetch(`/api/releases?semesterId=${semesterId}`, {
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
    } finally {
      setIsLoadingReleases(false);
    }
  }, [semesterId]);

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
        setNotification({
          message: `Failed to ${archive ? 'archive' : 'unarchive'} release: ${error.message}`,
          type: 'error'
        });
      }
    }
  };

  const handleDeleteRelease = async (releaseId: number) => {
    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete release');
      await fetchReleases();
      setNotification({ message: 'Release deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting release:', error);
      setNotification({ message: 'Failed to delete release', type: 'error' });
    }
  };

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { fetchReleases(); }, [fetchReleases]);
  useEffect(() => { 
    if (notification) { 
      const timer = setTimeout(() => { setNotification(null); }, 3000); 
      return () => clearTimeout(timer); 
    } 
  }, [notification]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((application: Application) => {
          // Search across name, barangay, and school
          const searchStr = `${application.first_name} ${application.last_name} ${application.barangay} ${application.school}`.toLowerCase();
          const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
          
          // Date filtering based on submitted_at
          let matchesDate = true;
          if (filters.dateRange.from && filters.dateRange.to) {
              const submittedDate = new Date(application.submitted_at);
              matchesDate = submittedDate >= new Date(filters.dateRange.from) && 
                            submittedDate <= new Date(filters.dateRange.to);
          }
          
          // Status filtering
          let matchesStatus = true;
          if (filters.status !== 'all') {
            matchesStatus = application.status === filters.status;
          }
          
          return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a: Application, b: Application) => {
        const dateA = new Date(a.submitted_at).getTime();
        const dateB = new Date(b.submitted_at).getTime();
        return dateB - dateA;
      });
  }, [applications, searchQuery, filters]);

  const handleApplyFilters = (newFilters: ApplicationFilters) => { 
    setFilters(newFilters); 
    setIsFilterModalOpen(false); 
  };
  
  const handleResetFilters = () => { 
    setFilters({ dateRange: { from: '', to: '' }, status: 'all' }); 
    setIsFilterModalOpen(false); 
  };

  // Full page loading state
  if (isLoading && applications.length === 0) {
    return <BrandedLoader title="Loading Applications" subtitle="Reviewing scholarship applications..." />;
  }

  return (
    <div className="px-10 pt-8 pb-6 max-w-[1600px] mx-auto space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/applications')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-gray-900">Semester Applications</h1>
            <p className="text-sm text-gray-500">View and manage scholarship applications for this semester.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search applicants..." 
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
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
              <span className="px-2.5 py-0.5 text-sm bg-blue-100 text-blue-600 rounded-full">
                {filteredApplications.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(true)} 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barangay
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
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
                {filteredApplications
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((application) => (
                  <tr key={application.application_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.first_name} {application.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {application.email_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.barangay}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.school}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/admin/applications/school-year/${schoolYearId}/${semesterId}/${application.user_id}`)}
                        className="cursor-pointer px-3 py-1 rounded-md text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Applications Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && filteredApplications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredApplications.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of{' '}
                  {filteredApplications.length} results
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded border cursor-pointer
                    ${currentPage === 1 
                      ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {currentPage > 2 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 border border-gray-300 rounded cursor-pointer"
                  >
                    1
                  </button>
                )}
                
                {currentPage > 3 && <span className="text-gray-500">...</span>}
                
                {Array.from({ length: Math.ceil(filteredApplications.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center px-3 py-1 text-sm rounded border cursor-pointer
                        ${currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                
                {currentPage < Math.ceil(filteredApplications.length / itemsPerPage) - 2 && 
                  <span className="text-gray-500">...</span>
                }
                
                {currentPage < Math.ceil(filteredApplications.length / itemsPerPage) - 1 && (
                  <button
                    onClick={() => setCurrentPage(Math.ceil(filteredApplications.length / itemsPerPage))}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 border border-gray-300 rounded cursor-pointer"
                  >
                    {Math.ceil(filteredApplications.length / itemsPerPage)}
                  </button>
                )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredApplications.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredApplications.length / itemsPerPage)}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded border cursor-pointer
                    ${currentPage >= Math.ceil(filteredApplications.length / itemsPerPage)
                      ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Releases Section */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-end">
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

        {/* Budget Input Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Semester Budget:</h3>
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
              <div className="text-sm text-gray-500 mt-1">This semester</div>
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

        {/* Releases Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                      {releases.filter(r => !r.isArchived).length}
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
                      {releases.filter(r => r.isArchived).length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoadingReleases ? (
            <div className="px-6 py-4 text-center text-gray-500">Loading releases...</div>
          ) : releases.filter(r => activeTab === 'active' ? !r.isArchived : r.isArchived).length === 0 ? (
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
                  {releases
                    .filter(r => activeTab === 'active' ? !r.isArchived : r.isArchived)
                    .sort((a, b) => {
                      const dateA = new Date(`${a.releasedate}T${a.releasetime}`);
                      const dateB = new Date(`${b.releasedate}T${b.releasetime}`);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((release) => {
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
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <ScheduleReleaseModal
          onClose={() => {
            setShowScheduleModal(false);
            setEditingRelease(null);
          }}
          release={editingRelease || undefined}
          semesterId={semesterId}
          onSuccess={() => {
            fetchReleases();
            setShowScheduleModal(false);
            setEditingRelease(null);
            setNotification({ message: 'Release scheduled successfully', type: 'success' });
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
              await handleDeleteRelease(selectedRelease.releaseid);
              setShowDeleteModal(false);
              setSelectedRelease(null);
            }
          }}
          release={selectedRelease}
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

      <ApplicationFilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={handleApplyFilters} 
        onReset={handleResetFilters} 
        initialFilters={filters} 
      />
    </div>
  );
}

// --- MODAL COMPONENTS ---
interface ApplicationFilterModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onApply: (filters: ApplicationFilters) => void; 
  onReset: () => void; 
  initialFilters: ApplicationFilters; 
}

function ApplicationFilterModal({ isOpen, onClose, onApply, onReset, initialFilters }: ApplicationFilterModalProps) {
  const [dateRange, setDateRange] = useState(initialFilters.dateRange);
  const [status, setStatus] = useState(initialFilters.status);
  
  useEffect(() => { 
    setDateRange(initialFilters.dateRange); 
    setStatus(initialFilters.status);
  }, [isOpen, initialFilters]);

  const handleApply = () => { 
    onApply({ dateRange, status }); 
  };
  
  const handleLocalReset = () => { 
    setDateRange({ from: '', to: '' }); 
    setStatus('all'); 
    onReset(); 
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
          <h3 className="text-2xl font-bold text-gray-900">Filter Applications</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 grow overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Submission Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-100">
              <button onClick={() => handleDateShortcut(7)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 7 days
              </button>
              <span className="text-gray-300 self-center">•</span>
              <button onClick={() => handleDateShortcut(30)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 30 days
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Application Status</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="all" 
                  checked={status === 'all'} 
                  onChange={(e) => setStatus(e.target.value as ApplicationFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">All Applications</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="pending" 
                  checked={status === 'pending'} 
                  onChange={(e) => setStatus(e.target.value as ApplicationFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Pending</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="approved" 
                  checked={status === 'approved'} 
                  onChange={(e) => setStatus(e.target.value as ApplicationFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Approved</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="rejected" 
                  checked={status === 'rejected'} 
                  onChange={(e) => setStatus(e.target.value as ApplicationFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Rejected</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            Reset Filters
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleApply} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}