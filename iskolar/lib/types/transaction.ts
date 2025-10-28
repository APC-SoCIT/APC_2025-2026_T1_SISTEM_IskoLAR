/**
 * Transaction Type Definitions
 * Used for disbursement transaction records across the system
 */

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  applicationSubmitted: string; // ISO date string - when application was submitted
  date: string; // ISO date string - when disbursement occurred
  amount: number;
  remarks: string;
  status: TransactionStatus;
  processedBy?: string; // Admin only: name or ID of the admin who processed
  applicantId?: string; // Admin only: ID of the applicant
  applicantName?: string; // Admin only: name of the applicant
}

export interface TransactionSummary {
  totalDisbursed: number;
  totalPending: number;
  transactionCount: number;
}
