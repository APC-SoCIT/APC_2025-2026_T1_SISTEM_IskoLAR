'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SchoolYear, Semester } from '@/lib/types/school-year';
import AddSemesterModal from './AddSemesterModal';

export default function SchoolYearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const fetchSchoolYear = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/school-years/${params.id}`);
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
        },
        body: JSON.stringify({ applications_open: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle applications');
      
      // Update local state
      setSchoolYear(prev => {
        if (!prev) return null;
        return {
          ...prev,
          semesters: prev.semesters?.map(sem => 
            sem.id === semesterId 
              ? { ...sem, applications_open: !sem.applications_open }
              : sem
          ),
        };
      });
    } catch (error) {
      console.error('Error toggling applications:', error);
    }
  };

  const handleDeleteSemester = async () => {
    if (!selectedSemesterId) return;

    try {
      const response = await fetch(`/api/admin/semesters/${selectedSemesterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('Invalid admin password');
          return;
        }
        throw new Error('Failed to delete semester');
      }

      // Update local state
      setSchoolYear(prev => {
        if (!prev) return null;
        return {
          ...prev,
          semesters: prev.semesters?.filter(sem => sem.id !== selectedSemesterId),
        };
      });

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
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Academic Year {schoolYear.year} - {schoolYear.year + 1}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage semesters and applications
                </p>
              </div>
              <button
                onClick={() => setShowAddSemesterModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Semester
              </button>
            </div>
          </div>

          {/* Semesters List */}
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
            {schoolYear.semesters?.map((semester) => (
              <div key={semester.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {semester.name}
                    </h3>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      semester.applications_open 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {semester.applications_open ? 'Open' : 'Closed'} for Applications
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push('/admin/applications/all')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      View All Applications
                    </button>
                    <button
                      onClick={() => handleToggleApplications(semester.id, semester.applications_open)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        semester.applications_open
                          ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {semester.applications_open ? 'Close' : 'Open'} Applications
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSemesterId(semester.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Semester
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Warning: This will delete all applications associated with this semester. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password to confirm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAdminPassword('');
                  setSelectedSemesterId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSemester}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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