/**
 * Scholar Transaction History Component
 * Matches the design specification with Application Submitted column
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { mockScholarTransactions } from '@/lib/data/mockTransactions';
import { formatCurrency, getStatusBadgeClasses } from '@/lib/utils/transactionUtils';

export default function TransactionHistory() {
  const transactions = mockScholarTransactions;

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
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
        <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
      </div>

      {/* Desktop Table View */}
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
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
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
