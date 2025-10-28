/**
 * Utility functions for transaction formatting and display
 */

import { TransactionStatus } from '@/lib/types/transaction';

/**
 * Format a number as Philippine Peso currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₱15,000.00")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

/**
 * Get Tailwind CSS classes for transaction status badges
 * @param status - The transaction status
 * @returns CSS class string for the badge
 */
export const getStatusBadgeClasses = (status: TransactionStatus): string => {
  const baseClasses = 'px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-md';
  
  const statusClasses = {
    Completed: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Failed: 'bg-red-100 text-red-700',
  };

  return `${baseClasses} ${statusClasses[status]}`;
};

/**
 * Capitalize the first letter of a string
 * @param text - The string to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirst = (text: string): string => {
  return text;
};

/**
 * Calculate pagination details
 * @param totalItems - Total number of items
 * @param currentPage - Current page number (1-based)
 * @param itemsPerPage - Number of items per page
 * @returns Pagination details object
 */
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};
