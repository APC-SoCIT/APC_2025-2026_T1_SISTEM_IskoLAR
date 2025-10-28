"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AIVerificationPanel from '@/app/components/admin/AIVerificationPanel';
import AIVerificationSummary from '@/app/components/admin/AIVerificationSummary';

// --- TYPE DEFINITIONS ---
type ApplicationDetail = {
  appdet_id: string;
  user_id: string;
  semester_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  junior_high_school_name: string;
  junior_high_school_address: string;
  junior_high_year_started: number;
  junior_high_year_ended: number;
  senior_high_school_name: string;
  senior_high_school_address: string;
  senior_high_year_started: number;
  senior_high_year_ended: number;
  college_address: string;
  year_level: number;
  college_year_started: number;
  college_year_grad: number;
  mother_maiden_name: string;
  mother_occupation: string | null;
  father_full_name: string;
  father_occupation: string | null;
};

type UserInfo = {
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email_address: string;
  mobile_number: string;
  gender: string;
  birthdate: string;
  address_line1: string;
  address_line2: string | null;
  barangay: string;
  zip_code: string;
  college_university: string;
  college_course: string;
};

type Document = {
  documents_id?: string;
  doc_id?: string;
  document_id?: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at?: string;
  created_at?: string;
};

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
// --- END TYPE DEFINITIONS ---

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const schoolYearId = params.id as string;
  const semesterId = params.semesterID as string;
  const userId = params.userID as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'transaction-history' | 'personal-info' | 'educational-background' | 'guardian-info' | 'documents' | 'ai-verification'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [applicationDetail, setApplicationDetail] = useState<ApplicationDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  // User history state
  const [userHistory, setUserHistory] = useState<{
    applications: HistoricalApplication[];
    releases: HistoricalRelease[];
  }>({ applications: [], releases: [] });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchApplicationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data from API route
      const response = await fetch(
        `/api/admin/applications/${userId}?userId=${userId}&semesterId=${semesterId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch application data');
      }

      const data = await response.json();
      
      console.log('Fetched application data:', data);
      console.log('Documents:', data.documents);
      if (data.documents && data.documents.length > 0) {
        console.log('First document structure:', data.documents[0]);
        console.log('Document keys:', Object.keys(data.documents[0]));
      }
      
      setUserInfo(data.user);
      setApplicationDetail(data.application);
      setDocuments(data.documents || []);

    } catch (err) {
      console.error('Error fetching application data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [userId, semesterId]);

  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData]);

  const fetchUserHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/admin/users/${userId}/history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user history');
      }

      const data = await response.json();
      console.log('User history API response:', data);
      console.log('Applications:', data.applications);
      console.log('Releases:', data.releases);
      if (data.applications && data.applications.length > 0) {
        console.log('First application structure:', data.applications[0]);
        console.log('First application semesters:', data.applications[0].semesters);
        console.log('First application school_years:', data.applications[0].semesters?.school_years);
      }
      setUserHistory(data);
    } catch (err) {
      console.error('Error fetching user history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'transaction-history') {
      fetchUserHistory();
    }
  }, [activeTab, fetchUserHistory]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!applicationDetail) return;

    try {
      const response = await fetch(`/api/admin/applications/${applicationDetail.appdet_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setNotification({ 
        message: `Application ${newStatus} successfully`, 
        type: 'success' 
      });
      
      // Update local state
      setApplicationDetail({ 
        ...applicationDetail, 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setNotification({ 
        message: err instanceof Error ? err.message : 'Failed to update application status', 
        type: 'error' 
      });
    }
  };

  const viewDocument = async (doc: Document) => {
    try {
      const docId = doc.documents_id || doc.document_id || doc.doc_id;
      console.log('Attempting to view document:', doc);
      console.log('Document ID:', docId);
      
      if (!docId) {
        throw new Error('Document ID not found');
      }
      
      // Use API route to generate signed URL
      const response = await fetch(`/api/admin/documents/${docId}`);
      const data = await response.json();

      console.log('API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document URL');
      }

      if (data.url) {
        console.log('Successfully generated signed URL');
        setSelectedDocument(doc);
        setDocumentUrl(data.url);
      } else {
        throw new Error('No URL returned from API');
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      setNotification({ 
        message: `Failed to view document: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setDocumentUrl(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#f5f6fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo || !applicationDetail) {
    return (
      <div className="min-h-screen w-full bg-[#f5f6fa] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-sm text-gray-500 mb-6">{error || 'Application not found'}</p>
          <button
            onClick={() => router.push(`/admin/applications/school-year/${schoolYearId}/${semesterId}`)}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 pt-8 pb-6 max-w-[1600px] mx-auto space-y-6">
      {/* Floating Notification Banner */}
      {notification && (
        <div className="fixed top-4 left-1/2 z-50 animate-slideDown">
          <div className="transform -translate-x-1/2">
            <div className="mx-4 inline-block min-w-[280px] max-w-[90vw]">
              <div className={`p-4 rounded-lg border shadow-lg transition-all duration-200 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="shrink-0">
                    {notification.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium whitespace-normal wrap-break-word ${
                      notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setNotification(null)}
                        className={`inline-flex rounded-md p-1.5 focus:outline-none ${
                          notification.type === 'success' 
                            ? 'text-green-500 hover:bg-green-100' 
                            : 'text-red-500 hover:bg-red-100'
                        }`}
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/applications/school-year/${schoolYearId}/${semesterId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-gray-900">Application Review</h1>
            <p className="text-sm text-gray-500">
              {userInfo.first_name} {userInfo.last_name} • {userInfo.email_address}
            </p>
          </div>
        </div>
        
        {/* Status Badge and Actions */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            applicationDetail.status === 'approved' ? 'bg-green-100 text-green-800' :
            applicationDetail.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {applicationDetail.status.toUpperCase()}
          </span>
          
          {applicationDetail.status === 'pending' && (
            <React.Fragment>
              <button
                onClick={() => handleStatusUpdate('approved')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircleIcon className="h-5 w-5" />
                Reject
              </button>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transaction-history')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'transaction-history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Applicant History
            </button>
            <button
              onClick={() => setActiveTab('personal-info')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'personal-info'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('educational-background')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'educational-background'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Educational Background
            </button>
            <button
              onClick={() => setActiveTab('guardian-info')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'guardian-info'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Guardian Information
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('ai-verification')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'ai-verification'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Verification
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Verification Summary */}
              <AIVerificationSummary userId={userId} />

              {/* Application Metadata */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Application ID</label>
                    <p className="text-sm font-medium text-gray-900 font-mono">{applicationDetail.appdet_id}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <p className={`text-sm font-medium capitalize ${
                      applicationDetail.status === 'approved' ? 'text-green-600' :
                      applicationDetail.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {applicationDetail.status}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Submitted On</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(applicationDetail.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Updated</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(applicationDetail.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Summary */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userInfo.first_name} {userInfo.middle_name} {userInfo.last_name}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Course</p>
                    <p className="text-sm font-semibold text-gray-900">{userInfo.college_course}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium mb-1">Year Level</p>
                    <p className="text-sm font-semibold text-gray-900">Year {applicationDetail.year_level}</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'transaction-history' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship History</h3>
                
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
                        <p className="mt-1 text-sm text-gray-500">This user has no previous scholarship applications</p>
                      </div>
                    ) : (
                      <>
                        {userHistory.applications.map((app, index) => {
                          const isCurrentApp = app.appdet_id === applicationDetail?.appdet_id;
                          const semester = app.semesters;
                          const schoolYear = semester?.school_years;
                          const academicYear = schoolYear?.academic_year;
                          
                          console.log('Application data:', {
                            appdet_id: app.appdet_id,
                            semester: semester,
                            schoolYear: schoolYear,
                            academicYear: academicYear
                          });
                          
                          return (
                            <div
                              key={app.appdet_id}
                              className={`bg-white p-6 rounded-lg border-2 shadow-sm ${
                                isCurrentApp ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    isCurrentApp ? 'bg-blue-100' : 
                                    app.status === 'approved' ? 'bg-green-100' :
                                    app.status === 'rejected' ? 'bg-red-100' :
                                    'bg-yellow-100'
                                  }`}>
                                    <svg className={`w-5 h-5 ${
                                      isCurrentApp ? 'text-blue-600' :
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
                                    {isCurrentApp && (
                                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-1">
                                        CURRENT APPLICATION
                                      </span>
                                    )}
                                    {index === 0 && !isCurrentApp && (
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
                                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Course</p>
                                    <p className="text-sm font-medium text-gray-900">{userInfo?.college_course}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Year Level</p>
                                    <p className="text-sm font-medium text-gray-900">Year {app.year_level}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">University</p>
                                    <p className="text-sm font-medium text-gray-900">{userInfo?.college_university}</p>
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
                                      console.log('Filtering releases for semester:', app.semester_id, 'Found:', appReleases.length);
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
              </section>
            </div>
          )}

          {activeTab === 'personal-info' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.first_name} {userInfo.middle_name} {userInfo.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                  <p className="text-sm font-medium text-gray-900">{userInfo.email_address}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                  <p className="text-sm font-medium text-gray-900">{userInfo.mobile_number}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gender</label>
                  <p className="text-sm font-medium text-gray-900">{userInfo.gender}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(userInfo.birthdate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Barangay</label>
                  <p className="text-sm font-medium text-gray-900">{userInfo.barangay}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Complete Address</label>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.address_line1}{userInfo.address_line2 ? `, ${userInfo.address_line2}` : ''}, {userInfo.barangay}, Makati City, {userInfo.zip_code}
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'educational-background' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h3>
              <div className="space-y-4">
                {/* Junior High School */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Junior High School</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Name</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.junior_high_school_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Address</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.junior_high_school_address}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.junior_high_year_started}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Graduated</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.junior_high_year_ended}</p>
                    </div>
                  </div>
                </div>

                {/* Senior High School */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Senior High School</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Name</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.senior_high_school_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Address</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.senior_high_school_address}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.senior_high_year_started}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Graduated</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.senior_high_year_ended}</p>
                    </div>
                  </div>
                </div>

                {/* College */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">College / University</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Name</label>
                      <p className="text-sm font-medium text-gray-900">{userInfo.college_university}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School Address</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.college_address}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Course</label>
                      <p className="text-sm font-medium text-gray-900">{userInfo.college_course}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Level</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.year_level}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.college_year_started}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expected Graduation</label>
                      <p className="text-sm font-medium text-gray-900">{applicationDetail.college_year_grad}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guardian-info' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Maiden Name</label>
                  <p className="text-sm font-medium text-gray-900">{applicationDetail.mother_maiden_name}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Occupation</label>
                  <p className="text-sm font-medium text-gray-900">{applicationDetail.mother_occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father&apos;s Full Name</label>
                  <p className="text-sm font-medium text-gray-900">{applicationDetail.father_full_name}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Father&apos;s Occupation</label>
                  <p className="text-sm font-medium text-gray-900">{applicationDetail.father_occupation || 'N/A'}</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Documents</h3>
                  <p className="mt-1 text-sm text-gray-500">No documents have been uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.documents_id || doc.document_id || doc.doc_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <DocumentIcon className="h-8 w-8 text-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.document_type}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.file_name}</p>
                          <p className="text-xs text-gray-400">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                            {' '}Uploaded {new Date(doc.uploaded_at || doc.created_at || '').toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => viewDocument(doc)}
                        className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-verification' && (
            <AIVerificationPanel 
              userId={userId}
              onVerificationComplete={fetchApplicationData}
            />
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && documentUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedDocument.document_type}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedDocument.file_name}</p>
              </div>
              <button
                onClick={closeDocumentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircleIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-6 min-h-0">
              {selectedDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full rounded-lg border border-gray-200"
                  title={selectedDocument.document_type}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={documentUrl}
                    alt={selectedDocument.document_type}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="flex gap-3">
                <a
                  href={documentUrl}
                  download={selectedDocument.file_name}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={closeDocumentModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
