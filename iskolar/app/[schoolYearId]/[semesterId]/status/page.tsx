'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import ScholarSideBar from "@/app/components/ScholarSideBar";
import BrandedLoader from '@/app/components/ui/BrandedLoader';

interface SchoolYear {
  id: string;
  academic_year: number;
  is_active: boolean;
}

interface Semester {
  id: string;
  name: string;
  school_year_id: string;
  applications_open: boolean;
  start_date: string;
  end_date: string;
}

interface ApplicationStatus {
  appdet_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Release {
  releaseid: number;
  releasetype: string;
  releasedate: string;
  releasetime: string;
  barangay: string | null;
  location: string | null;
  amountperstudent: number;
  numberofrecipients: number;
  additionalnotes: string | null;
  isArchived: boolean;
}

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const schoolYearId = params.schoolYearId as string;
  const semesterId = params.semesterId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [userBarangay, setUserBarangay] = useState<string | null>(null);
  const [loadingReleases, setLoadingReleases] = useState(false);

  // Helper function to format semester name
  const formatSemesterName = (name: string) => {
    if (name === 'FIRST') return 'First Semester';
    if (name === 'SECOND') return 'Second Semester';
    return name;
  };

  // Fetch releases for user's barangay
  const fetchReleasesForBarangay = useCallback(async (barangay: string) => {
    setLoadingReleases(true);
    try {
      console.log('Fetching releases for barangay:', barangay);
      
      // Try exact match first
      let { data, error } = await supabase
        .from('releases')
        .select('*')
        .ilike('barangay', barangay)
        .eq('isArchived', false)
        .gte('releasedate', new Date().toISOString().split('T')[0])
        .order('releasedate', { ascending: true })
        .order('releasetime', { ascending: true });

      // If no results and barangay contains "Village", try with just the first part
      if ((!data || data.length === 0) && barangay.includes('Village')) {
        const barangayBase = barangay.split(' Village')[0];
        console.log('Trying alternative search with:', barangayBase);
        
        ({ data, error } = await supabase
          .from('releases')
          .select('*')
          .ilike('barangay', `%${barangayBase}%`)
          .eq('isArchived', false)
          .gte('releasedate', new Date().toISOString().split('T')[0])
          .order('releasedate', { ascending: true })
          .order('releasetime', { ascending: true }));
      }

      if (error) {
        console.error('Error fetching releases:', error);
      } else {
        console.log('Releases found:', data);
        setReleases(data || []);
      }
    } catch (err) {
      console.error('Error fetching releases:', err);
    } finally {
      setLoadingReleases(false);
    }
  }, []);

  const validateAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(schoolYearId) || !uuidRegex.test(semesterId)) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel for better performance
      const [
        { data: yearData, error: yearError },
        { data: semesterData, error: semesterError },
        { data: { user } }
      ] = await Promise.all([
        supabase
          .from('school_years')
          .select('id, academic_year, is_active')
          .eq('id', schoolYearId)
          .single(),
        supabase
          .from('semesters')
          .select('id, name, school_year_id, applications_open, start_date, end_date')
          .eq('id', semesterId)
          .eq('school_year_id', schoolYearId)
          .single(),
        supabase.auth.getUser()
      ]);

      if (yearError || !yearData) {
        setError('Academic Year not found');
        setLoading(false);
        return;
      }

      if (semesterError || !semesterData) {
        setError('Semester not found for this academic year');
        setLoading(false);
        return;
      }

      setSchoolYear(yearData);
      setSemester(semesterData);

      // Fetch application status
      if (user) {
        const { data: appData, error: appError } = await supabase
          .from('application_details')
          .select('appdet_id, status, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('semester_id', semesterId)
          .single();

        if (appError && appError.code !== 'PGRST116') {
          console.error('Error fetching application:', appError);
        }

        if (appData) {
          setApplication(appData);
          
          // If approved, fetch user's barangay and releases
          if (appData.status === 'approved') {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('barangay')
              .eq('user_id', user.id)
              .single();

            console.log('User barangay data:', userData);
            console.log('User barangay error:', userError);

            if (!userError && userData?.barangay) {
              setUserBarangay(userData.barangay);
              await fetchReleasesForBarangay(userData.barangay);
            } else {
              console.log('No barangay found or error occurred');
            }
          }
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error validating route:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }, [schoolYearId, semesterId, fetchReleasesForBarangay]);

  useEffect(() => {
    validateAndFetchData();
  }, [validateAndFetchData]);

  // Full-page loading screen with IskoLARS branding
  if (loading) {
    return (
      <>
        <ScholarSideBar />
        <div className="min-h-screen w-full pl-64">
          <BrandedLoader 
            title="Loading Application Status" 
            subtitle="Retrieving your application details…" 
          />
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <ScholarSideBar />
        <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => router.push('/scholar/announcements')}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // No application found
  if (!application) {
    return (
      <>
        <ScholarSideBar />
        <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Found</h3>
            <p className="text-sm text-gray-500 mb-6">
              You haven&apos;t submitted an application for the {semester?.name ? formatSemesterName(semester.name) : 'current semester'} yet.
            </p>
            <Link
              href={`/${schoolYearId}/${semesterId}/application`}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Submit Application
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Status badge configuration
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      message: 'Your application is being reviewed',
      description: 'Please wait while we process your application.'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      message: 'Your application has been approved!',
      description: 'Congratulations! You have been accepted for the scholarship.'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      message: 'Application not approved',
      description: 'Unfortunately, your application was not approved at this time.'
    }
  };

  const config = statusConfig[application.status];

  return (
    <>
      <ScholarSideBar />
      <div className="min-h-screen w-full bg-[#f5f6fa] pl-64">
        {/* Header */}
        <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
          <span className="text-lg font-semibold">
            Application Status
          </span>
          <span className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
            A.Y. {schoolYear?.academic_year} – {schoolYear ? schoolYear.academic_year + 1 : ''} • {semester?.name ? formatSemesterName(semester.name) : ''}
          </span>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className={`shrink-0 h-16 w-16 rounded-full ${config.bg} ${config.text} flex items-center justify-center border-2 ${config.border}`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-semibold ${config.text} mb-2`}>
                  {config.message}
                </h2>
                <p className="text-gray-600 mb-6">
                  {config.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`text-sm font-medium ${config.text} capitalize`}>
                      {application.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(application.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Application ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {application.appdet_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disbursement Schedule Section - Only show for approved applications */}
          {application.status === 'approved' && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Disbursement Schedule</h3>
                  <p className="text-sm text-gray-500">
                    {userBarangay ? `Schedule for ${userBarangay}` : 'Loading schedule information...'}
                  </p>
                </div>
              </div>

              {loadingReleases ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : releases.length > 0 ? (
                <div className="space-y-4">
                  {releases.map((release) => (
                    <div 
                      key={release.releaseid}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{release.releasetype}</h4>
                          {release.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {release.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ₱{release.amountperstudent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500">per student</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(release.releasedate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(`2000-01-01T${release.releasetime}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>

                      {release.additionalnotes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                          <p className="text-sm text-gray-700">{release.additionalnotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No Disbursement Schedule Yet</h4>
                  <p className="text-sm text-gray-500">
                    {userBarangay 
                      ? `There is no scheduled disbursement for ${userBarangay} at this time. Please check back later.`
                      : 'Disbursement schedule information is not available yet. Please check back later.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/scholar/announcements')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
            
            {application.status === 'pending' && (
              <button
                onClick={validateAndFetchData}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
