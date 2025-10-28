/**
 * Mock Transaction Data
 * Static data for testing and development
 * Replace with actual API calls in production
 */

import { Transaction } from '@/lib/types/transaction';

/**
 * Admin-side mock transactions
 * Includes data for multiple applicants with full admin context
 */
export const mockAdminTransactions: Transaction[] = [
  // Applicant: Juan Dela Cruz (APP-001)
  {
    id: 'TXN-2024-001',
    applicationSubmitted: '2024-09-01T08:00:00Z',
    date: '2024-10-15T08:30:00Z',
    amount: 25000,
    remarks: 'First Semester Disbursement',
    status: 'Completed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-001',
    applicantName: 'Juan Dela Cruz'
  },
  {
    id: 'TXN-2024-002',
    applicationSubmitted: '2024-08-15T10:00:00Z',
    date: '2024-09-20T14:15:00Z',
    amount: 15000,
    remarks: 'Tuition Assistance',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-001',
    applicantName: 'Juan Dela Cruz'
  },
  {
    id: 'TXN-2024-003',
    applicationSubmitted: '2024-07-20T09:00:00Z',
    date: '2024-08-10T10:00:00Z',
    amount: 10000,
    remarks: 'Book Allowance',
    status: 'Completed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-001',
    applicantName: 'Juan Dela Cruz'
  },
  {
    id: 'TXN-2024-004',
    applicationSubmitted: '2024-06-10T11:00:00Z',
    date: '2024-07-05T10:00:00Z',
    amount: 20000,
    remarks: 'Second Semester Disbursement',
    status: 'Pending',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-001',
    applicantName: 'Juan Dela Cruz'
  },

  // Applicant: Maria Garcia (APP-002)
  {
    id: 'TXN-2025-006',
    applicationSubmitted: '2024-10-01T08:00:00Z',
    date: '2025-10-10T08:00:00Z',
    amount: 18000,
    remarks: 'Tuition Fee - 1st Semester AY 2025-2026',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-002',
    applicantName: 'Maria Garcia'
  },
  {
    id: 'TXN-2025-007',
    applicationSubmitted: '2024-09-15T10:00:00Z',
    date: '2025-10-12T13:45:00Z',
    amount: 8000,
    remarks: 'Living Allowance - October 2025',
    status: 'Completed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-002',
    applicantName: 'Maria Garcia'
  },
  {
    id: 'TXN-2025-008',
    applicationSubmitted: '2024-10-05T09:00:00Z',
    date: '2025-10-18T15:20:00Z',
    amount: 6000,
    remarks: 'Laboratory Equipment Fee',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-002',
    applicantName: 'Maria Garcia'
  },
  {
    id: 'TXN-2025-009',
    applicationSubmitted: '2024-09-10T10:30:00Z',
    date: '2025-09-25T10:30:00Z',
    amount: 10000,
    remarks: 'Thesis Research Allowance',
    status: 'Completed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-002',
    applicantName: 'Maria Garcia'
  },

  // Applicant: Carlos Santos (APP-003)
  {
    id: 'TXN-2025-010',
    applicationSubmitted: '2024-10-01T09:00:00Z',
    date: '2025-10-22T09:15:00Z',
    amount: 20000,
    remarks: 'Tuition Fee - 1st Semester AY 2025-2026',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-003',
    applicantName: 'Carlos Santos'
  },
  {
    id: 'TXN-2025-011',
    applicationSubmitted: '2024-10-15T10:00:00Z',
    date: '2025-10-26T14:00:00Z',
    amount: 7500,
    remarks: 'Book Allowance - Engineering Textbooks',
    status: 'Pending',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-003',
    applicantName: 'Carlos Santos'
  },
  {
    id: 'TXN-2025-012',
    applicationSubmitted: '2024-09-20T08:30:00Z',
    date: '2025-10-05T08:30:00Z',
    amount: 5000,
    remarks: 'Miscellaneous Expenses - Academic Supplies',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-003',
    applicantName: 'Carlos Santos'
  },

  // Applicant: Anna Reyes (APP-004)
  {
    id: 'TXN-2025-013',
    applicationSubmitted: '2024-09-25T11:00:00Z',
    date: '2025-10-08T11:00:00Z',
    amount: 16000,
    remarks: 'Tuition Fee - 1st Semester AY 2025-2026',
    status: 'Completed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-004',
    applicantName: 'Anna Reyes'
  },
  {
    id: 'TXN-2025-014',
    applicationSubmitted: '2024-10-01T16:30:00Z',
    date: '2025-10-14T16:30:00Z',
    amount: 4500,
    remarks: 'Internet Allowance - October 2025',
    status: 'Completed',
    processedBy: 'Admin Pedro Reyes',
    applicantId: 'APP-004',
    applicantName: 'Anna Reyes'
  },
  {
    id: 'TXN-2025-015',
    applicationSubmitted: '2024-10-10T09:45:00Z',
    date: '2025-10-27T09:45:00Z',
    amount: 9000,
    remarks: 'Project Development Fund',
    status: 'Failed',
    processedBy: 'Admin Maria Santos',
    applicantId: 'APP-004',
    applicantName: 'Anna Reyes'
  },
];

/**
 * Scholar-side mock transactions
 * Personal transaction history for the logged-in scholar
 * Does not include admin-specific fields
 */
export const mockScholarTransactions: Transaction[] = [
  {
    id: 'TXN-2024-001',
    applicationSubmitted: '2024-09-01T08:00:00Z',
    date: '2024-10-15T08:30:00Z',
    amount: 25000,
    remarks: 'First Semester Disbursement',
    status: 'Completed'
  },
  {
    id: 'TXN-2024-002',
    applicationSubmitted: '2024-08-15T10:00:00Z',
    date: '2024-09-20T14:15:00Z',
    amount: 15000,
    remarks: 'Tuition Assistance',
    status: 'Completed'
  },
  {
    id: 'TXN-2024-003',
    applicationSubmitted: '2024-07-20T09:00:00Z',
    date: '2024-08-10T10:00:00Z',
    amount: 10000,
    remarks: 'Book Allowance',
    status: 'Completed'
  },
  {
    id: 'TXN-2024-004',
    applicationSubmitted: '2024-06-10T11:00:00Z',
    date: '2024-07-05T10:00:00Z',
    amount: 20000,
    remarks: 'Second Semester Disbursement',
    status: 'Pending'
  },
];

/**
 * Utility function to filter transactions by applicant ID
 * @param applicantId - The applicant ID to filter by
 * @returns Array of transactions for the specified applicant
 */
export const getTransactionsByApplicantId = (applicantId: string): Transaction[] => {
  return mockAdminTransactions.filter(txn => txn.applicantId === applicantId);
};

/**
 * Utility function to calculate transaction summary
 * @param transactions - Array of transactions to summarize
 * @returns Summary object with totals
 */
export const calculateTransactionSummary = (transactions: Transaction[]) => {
  const completed = transactions.filter(txn => txn.status === 'Completed');
  const pending = transactions.filter(txn => txn.status === 'Pending');
  
  return {
    totalDisbursed: completed.reduce((sum, txn) => sum + txn.amount, 0),
    totalPending: pending.reduce((sum, txn) => sum + txn.amount, 0),
    transactionCount: transactions.length,
  };
};
