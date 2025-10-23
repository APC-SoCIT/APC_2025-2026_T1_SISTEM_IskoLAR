'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SchoolYear, Semester } from '@/lib/types/school-year';
import AddSemesterModal from './AddSemesterModal';
import { useAuth } from '@/lib/useAuth';

export default function SchoolYearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const checkAndUpdateSemesterStatus = async (semester: Semester) => {
    const endDate = new Date(semester.end_date);
    const now = new Date();
    
    // If semester has ended and applications are still open, close them
    if (now > endDate && semester.applications_open) {
      try {
        const response = await fetch(`/api/admin/semesters/${semester.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applications_open: false }),
        });

        if (!response.ok) throw new Error('Failed to update semester status');
        
        return { ...semester, applications_open: false };
      } catch (error) {
        console.error('Error updating semester status:', error);
      }
    }
    return semester;
  };

  const fetchSchoolYear = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/school-years/${params.id}`, {
        cache: 'no-store', // Prevent caching
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch school year');
      const data = await response.json();
      setSchoolYear(data);
    } catch (error) {
      console.error('Error fetching school year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSchoolYear();
    }
  }, [params.id]);

  const handleToggleApplications = async (semesterId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/semesters/${semesterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ applications_open: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to toggle applications:', data.error);
        alert(data.error || 'Failed to toggle applications status');
        return;
      }
      
      // Refetch school year data to ensure we have the latest state
      await fetchSchoolYear();
    } catch (error) {
      console.error('Error toggling applications:', error);
      alert('An error occurred while toggling applications status');
    }
  };

  const handleDeleteSemester = async () => {
    if (!selectedSemesterId || !adminPassword.trim()) {
      alert('Please provide your admin password to delete the semester.');
      return;
    }

    if (!user || !(user as any).email) {
      alert('You must be logged in as an admin to delete semesters.');
      return;
    }

    // Log the semester being deleted
    const semesterToDelete = schoolYear?.semesters?.find(s => s.id === selectedSemesterId);
    console.log('Attempting to delete semester:', {
      selectedId: selectedSemesterId,
      semesterDetails: semesterToDelete
    });

    try {
      const response = await fetch(`/api/admin/semesters/${selectedSemesterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminPassword: adminPassword.trim(),
          adminEmail: (user as any).email
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Delete response:', {
          status: response.status,
          error: data.error,
          userEmail: (user as any).email
        });

        if (response.status === 403) {
          alert(data.error || 'Authentication failed. Please check your password and try again.');
          return;
        }
        if (response.status === 404) {
          alert('User account not found in the system. Please contact support.');
          return;
        }
        if (response.status === 500) {
          alert('Server error occurred. Please try again or contact support if the problem persists.');
          return;
        }
        
        alert(data.error || 'Failed to delete semester. Please try again.');
        return;
      }

      // Force a fresh fetch of the data
      await fetchSchoolYear();

      setShowDeleteModal(false);
      setAdminPassword('');
      setSelectedSemesterId(null);
    } catch (error) {
      console.error('Error deleting semester:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!schoolYear) {
    return <div>School year not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="px-10 pt-8 pb-6 max-w-[1600px] mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm px-8 py-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Academic Year {schoolYear.academic_year} - {schoolYear.academic_year + 1}
                  </h1>
                  <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Manage semester schedules and application periods
                </p>
              </div>
              <button
                onClick={() => setShowAddSemesterModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none shadow-sm hover:shadow group"
              >
                <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Semester
              </button>
            </div>
          </div>

          {/* Semesters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolYear.semesters?.map((semester) => {
              const startDate = new Date(semester.start_date);
              const endDate = new Date(semester.end_date);
              const now = new Date();
              const hasEnded = now > endDate;
              const dateFormatter = new Intl.DateTimeFormat('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              });

              // Automatically check and update semester status
              if (hasEnded && semester.applications_open) {
                checkAndUpdateSemesterStatus(semester);
              }

              return (
                <div key={semester.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {semester.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            hasEnded 
                              ? 'bg-gray-100 text-gray-700'
                              : semester.applications_open 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {hasEnded 
                              ? 'Ended' 
                              : semester.applications_open 
                                ? 'Open' 
                                : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                        </svg>
                        <span>
                          {dateFormatter.format(startDate)} - {dateFormatter.format(endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push('/admin/applications/all')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                        View Applications
                      </button>
                      <button
                        onClick={() => handleToggleApplications(semester.id, semester.applications_open)}
                        disabled={hasEnded}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          hasEnded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : semester.applications_open
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {semester.applications_open ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {semester.applications_open ? 'Close' : 'Open'} Applications
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => {
                          setSelectedSemesterId(semester.id);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 -ml-3 group/delete"
                      >
                        <svg className="w-4 h-4 transform group-hover/delete:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Semester
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {schoolYear.semesters?.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">No semesters found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Delete Semester
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Warning: This will delete all applications associated with this semester. This action cannot be undone.
            </p>
            <div className="space-y-4 mb-8">
              <label className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter admin password to confirm"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAdminPassword('');
                  setSelectedSemesterId(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSemester}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Semester Modal */}
      {showAddSemesterModal && (
        <AddSemesterModal
          onClose={() => setShowAddSemesterModal(false)}
          onAdd={() => {
            // Refetch school year data
            fetchSchoolYear();
            setShowAddSemesterModal(false);
          }}
        />
      )}
    </div>
  );
}