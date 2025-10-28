/**
 * Applicant Detail Page
 * Shows detailed information about a specific applicant
 * Provides navigation to transaction history
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicantDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Mock applicant data - replace with real API call
  const applicantData = {
    id: resolvedParams.id,
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    status: 'approved',
    applicationDate: '2025-10-15',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Applications
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Applicant Details
          </h1>
          <p className="text-gray-600 mt-2">
            View applicant information and transaction history
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {applicantData.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Applicant ID</p>
                  <p className="font-medium">{applicantData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{applicantData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {applicantData.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Date</p>
                  <p className="font-medium">{applicantData.applicationDate}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/applications/${resolvedParams.id}/history`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Transaction History
                </Link>
                <button
                  onClick={() => alert('View Documents feature coming soon')}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Documents
                </button>
                <button
                  onClick={() => alert('Edit Applicant feature coming soon')}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Information
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Viewing Applicant: {resolvedParams.id}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Click &quot;View Transaction History&quot; to see all disbursement records for this applicant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
