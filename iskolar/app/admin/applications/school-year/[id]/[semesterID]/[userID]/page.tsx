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
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
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
                <div className="space-y-4">
                  {/* Current Application */}
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-300 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            CURRENT APPLICATION
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        applicationDetail.status === 'approved' ? 'bg-green-100 text-green-800' :
                        applicationDetail.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicationDetail.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <h4 className="text-base font-semibold text-gray-900">Academic Year 2025-2026 • 1st Semester</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Application submitted on {new Date(applicationDetail.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Course</p>
                          <p className="text-sm font-medium text-gray-900">{userInfo.college_course}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Year Level</p>
                          <p className="text-sm font-medium text-gray-900">Year {applicationDetail.year_level}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">University</p>
                          <p className="text-sm font-medium text-gray-900">{userInfo.college_university}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expected Graduation</p>
                          <p className="text-sm font-medium text-gray-900">{applicationDetail.college_year_grad}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previous Application (if year level > 1) */}
                  {applicationDetail.year_level > 1 && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Previous Semester</span>
                        </div>
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          APPROVED
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">Academic Year 2024-2025 • 2nd Semester</h4>
                        <p className="text-xs text-gray-500 mt-1">Application submitted on March 15, 2025</p>
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Course</p>
                            <p className="text-sm font-medium text-gray-900">{userInfo.college_course}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Year Level</p>
                            <p className="text-sm font-medium text-gray-900">Year {applicationDetail.year_level - 1}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="text-sm font-medium text-green-600">Completed</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-gray-900">6 months</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Year Application (if year level > 2) */}
                  {applicationDetail.year_level > 2 && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">First Year Application</span>
                        </div>
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          APPROVED
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">Academic Year {applicationDetail.college_year_started - 1}-{applicationDetail.college_year_started} • 1st Semester</h4>
                        <p className="text-xs text-gray-500 mt-1">Application submitted on September 10, {applicationDetail.college_year_started - 1}</p>
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Course</p>
                            <p className="text-sm font-medium text-gray-900">{userInfo.college_course}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Year Level</p>
                            <p className="text-sm font-medium text-gray-900">Year 1</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="text-sm font-medium text-green-600">Completed</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-gray-900">6 months</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No previous history message for first-year students */}
                  {applicationDetail.year_level === 1 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">First-Time Applicant</h3>
                      <p className="mt-1 text-sm text-gray-500">This is the first scholarship application for this student</p>
                      <p className="text-xs text-gray-400 mt-1">Previous applications will appear here in future semesters</p>
                    </div>
                  )}

                  {/* Application Timeline Summary */}
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 mt-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Academic Journey Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">College Year Started</p>
                        <p className="text-lg font-bold text-blue-600">{applicationDetail.college_year_started}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Current Year Level</p>
                        <p className="text-lg font-bold text-blue-600">{applicationDetail.year_level}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Expected Graduation</p>
                        <p className="text-lg font-bold text-blue-600">{applicationDetail.college_year_grad}</p>
                      </div>
                    </div>
                  </div>
                </div>
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
