/**
 * Admin Transaction History Page
 * Location: /admin/applications/[id]/history
 * 
 * Displays all disbursement transactions for a specific applicant
 * Matches the design specification with Application Submitted column
 */

'use client';

import { use } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getTransactionsByApplicantId } from '@/lib/data/mockTransactions';
import { formatCurrency, getStatusBadgeClasses } from '@/lib/utils/transactionUtils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicantHistoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Filter transactions for this specific applicant
  const applicantTransactions = getTransactionsByApplicantId(resolvedParams.id);

  // Get applicant name from first transaction
  const applicantName = applicantTransactions[0]?.applicantName || 'Applicant';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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

        {/* Applicant History Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <svg
              className="w-5 h-5 text-gray-700 mr-2"
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Applicant History</h2>
              <p className="text-sm text-gray-600">
                Disbursement records for {applicantName}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Application Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Remarks
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {applicantTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
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
                        <p className="text-gray-500 text-lg font-medium">
                          No transactions found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          This applicant has no disbursement records yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applicantTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {format(new Date(transaction.applicationSubmitted), 'MMMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {format(new Date(transaction.date), 'MMMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {transaction.remarks}
                      </td>
                      <td className="px-4 py-4">
                        <span className={getStatusBadgeClasses(transaction.status)}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Showing {applicantTransactions.length} transaction
              {applicantTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
