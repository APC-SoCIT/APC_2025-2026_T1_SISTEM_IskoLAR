'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SchoolYear, Semester, SemesterStats } from '@/lib/types/school-year';
import { supabase } from '@/lib/supabaseClient';
import { timeAsync } from '@/lib/utils/performance';

interface Application {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

interface ApplicationsSectionProps {
  schoolYears: SchoolYear[];
  isLoading: boolean;
}

export default function ApplicationsSection({ schoolYears, isLoading }: ApplicationsSectionProps) {
  const [semesterStats, setSemesterStats] = useState<Record<string, SemesterStats>>({});
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set());
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when schoolYears becomes available
    if (fetchedRef.current || schoolYears.length === 0) return;
    fetchedRef.current = true;

    (async () => {
      try {
        setIsLoadingStats(true);
        await timeAsync('fetch-semester-stats', async () => {
          // Get all semester IDs from the schoolYears we already have
          const semesterIds = schoolYears.flatMap(year => 
            (year.semesters || []).map((s: Semester) => s.id)
          );

          // Only fetch stats for semesters we're actually displaying
          // This is much faster than fetching all 50 semesters
          const { data, error } = await supabase
            .from('application_stats_by_semester')
            .select('*')
            .in('semester_id', semesterIds);

          if (error) throw error;

          // Convert array to record for easy lookup
          const statsMap = (data || []).reduce((acc, stat) => {
            acc[stat.semester_id] = stat;
            return acc;
          }, {} as Record<string, SemesterStats>);

          setSemesterStats(statsMap);
        });
      } catch (error) {
        console.error('Error fetching semester stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    })();
  }, [schoolYears]);

  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(semesterId)) {
        next.delete(semesterId);
      } else {
        next.add(semesterId);
      }
      return next;
    });
  };

  const getSemesterStatus = (semester: Semester): 'open' | 'closed' | 'ended' => {
    const now = new Date();
    const endDate = new Date(semester.end_date);
    
    if (now > endDate) return 'ended';
    if (semester.applications_open) return 'open';
    return 'closed';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
      ended: 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      open: 'Open',
      closed: 'Closed',
      ended: 'Ended'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // No inline loading - parent page handles all loading states
  
  // Group semesters by active/previous
  const activeSemesters: Semester[] = [];
  const previousSemesters: Semester[] = [];

  schoolYears.forEach(year => {
    (year.semesters || []).forEach((semester: Semester) => {
      if (year.isCurrent) {
        activeSemesters.push(semester);
      } else {
        previousSemesters.push(semester);
      }
    });
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900">Applications by Semester</h2>
            <p className="text-sm text-gray-500">View and manage scholarship applications</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Current/Active Semesters */}
        {activeSemesters.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Academic Year</h3>
            <div className="space-y-3">
              {activeSemesters.map(semester => {
                const stats = semesterStats[semester.id];
                const status = getSemesterStatus(semester);
                const isExpanded = expandedSemesters.has(semester.id);

                return (
                  <div
                    key={semester.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">
                                {semester.name}
                              </span>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isLoadingStats ? (
                            <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-gray-200 animate-pulse">
                              <div className="text-center">
                                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                <div className="text-xs text-gray-500 mt-1">Total</div>
                              </div>
                              <div className="h-10 w-px bg-gray-200"></div>
                              <div className="text-center">
                                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                                <div className="text-xs text-gray-500 mt-1">Approved</div>
                              </div>
                              <div className="text-center">
                                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                                <div className="text-xs text-gray-500 mt-1">Pending</div>
                              </div>
                            </div>
                          ) : stats ? (
                            <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-gray-200">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.total_applications}</div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                              <div className="h-10 w-px bg-gray-200"></div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">{stats.approved_count}</div>
                                <div className="text-xs text-gray-500">Approved</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-yellow-600">{stats.pending_count}</div>
                                <div className="text-xs text-gray-500">Pending</div>
                              </div>
                            </div>
                          ) : null}
                          <button
                            onClick={() => toggleSemester(semester.id)}
                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'View'} Applications
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 border-t border-gray-200">
                        <ApplicationsList semesterId={semester.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Previous Semesters */}
        {previousSemesters.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Semesters</h3>
            <div className="space-y-3">
              {previousSemesters.map(semester => {
                const stats = semesterStats[semester.id];
                const status = getSemesterStatus(semester);
                const isExpanded = expandedSemesters.has(semester.id);

                return (
                  <div
                    key={semester.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-gray-900">
                                {semester.name}
                              </span>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isLoadingStats ? (
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                          ) : stats ? (
                            <div className="text-sm text-gray-600">
                              {stats.total_applications} applications
                            </div>
                          ) : null}
                          <button
                            onClick={() => toggleSemester(semester.id)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'View'} Applications
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 border-t border-gray-200">
                        <ApplicationsList semesterId={semester.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSemesters.length === 0 && previousSemesters.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No semesters found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Nested component for displaying applications list
function ApplicationsList({ semesterId }: { semesterId: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplicationsForList = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({
        status: statusFilter,
        limit: '50'
      });

      const response = await fetch(
        `/api/admin/semesters/${semesterId}/applications?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [semesterId, statusFilter]);

  useEffect(() => {
    fetchApplicationsForList();
  }, [fetchApplicationsForList]);



  if (loading) {
    return <div className="text-center py-4">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No applications found for this semester</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scholar
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {app.users?.user_metadata?.full_name || app.users?.email || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">{app.users?.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
