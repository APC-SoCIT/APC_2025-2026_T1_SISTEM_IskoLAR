/**
 * Scholar Transaction History Component
 * Displays dynamic scholarship application and release history
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// User history types
interface HistoricalApplication {
  appdet_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  year_level: number;
  semester_id: string;
  semesters: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    school_year_id: string;
    school_years: {
      id: string;
      academic_year: number;
    };
  };
}

interface HistoricalRelease {
  releaseid: number;
  releasetype: string;
  releasedate: string;
  releasetime: string;
  location: string | null;
  amountperstudent: number;
  semester_id: string;
}

export default function TransactionHistory() {
  const [userHistory, setUserHistory] = useState<{
    applications: HistoricalApplication[];
    releases: HistoricalRelease[];
  }>({ applications: [], releases: [] });
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchUserHistory = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/admin/users/${userId}/history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user history');
      }

      const data = await response.json();
      console.log('Scholar history data:', data);
      setUserHistory(data);
    } catch (err) {
      console.error('Error fetching user history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserHistory();
    }
  }, [userId, fetchUserHistory]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-semibold text-gray-700 text-lg">Applicant History</span>
      </div>
      <hr className="border-gray-200 mb-4" />

      {isLoadingHistory ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading history...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userHistory.applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Application History</h3>
              <p className="mt-1 text-sm text-gray-500">You have no scholarship applications yet</p>
            </div>
          ) : (
            <>
              {userHistory.applications.map((app, index) => {
                const semester = app.semesters;
                const schoolYear = semester?.school_years;
                const academicYear = schoolYear?.academic_year;
                
                return (
                  <div
                    key={app.appdet_id}
                    className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          app.status === 'approved' ? 'bg-green-100' :
                          app.status === 'rejected' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            app.status === 'approved' ? 'text-green-600' :
                            app.status === 'rejected' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {app.status === 'approved' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : app.status === 'rejected' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          {index === 0 && (
                            <span className="text-xs text-gray-500 font-medium">Most Recent</span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <h4 className="text-base font-semibold text-gray-900">
                          {academicYear ? (
                            <>Academic Year {academicYear}-{academicYear + 1}</>
                          ) : (
                            'Academic Year N/A'
                          )} • {semester?.name === 'FIRST' ? '1st' : semester?.name === 'SECOND' ? '2nd' : 'N/A'} Semester
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Application submitted on {new Date(app.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Year Level</p>
                          <p className="text-sm font-medium text-gray-900">Year {app.year_level}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(app.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Show releases for approved applications */}
                      {app.status === 'approved' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Scholarship Releases
                          </h5>
                          {(() => {
                            const appReleases = userHistory.releases.filter(r => r.semester_id === app.semester_id);
                            return appReleases.length > 0 ? (
                              <div className="space-y-2">
                                {appReleases.map((release) => (
                                  <div key={release.releaseid} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 capitalize">{release.releasetype}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                          {new Date(release.releasedate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                          {' '} at {release.releasetime}
                                          {release.location && ` • ${release.location}`}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-green-700">
                                          ₱{release.amountperstudent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-gray-500">per student</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="bg-green-100 p-2 rounded-lg mt-2">
                                  <p className="text-xs font-semibold text-green-800">
                                    Total Received: ₱{appReleases.reduce((sum, r) => sum + r.amountperstudent, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No releases yet for this semester</p>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Overall Summary */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 mt-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Overall Scholarship Summary
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                    <p className="text-lg font-bold text-blue-600">{userHistory.applications.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Approved</p>
                    <p className="text-lg font-bold text-green-600">
                      {userHistory.applications.filter(a => a.status === 'approved').length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Releases</p>
                    <p className="text-lg font-bold text-purple-600">{userHistory.releases.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Amount Received</p>
                    <p className="text-lg font-bold text-green-600">
                      ₱{userHistory.releases.reduce((sum, r) => sum + r.amountperstudent, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
