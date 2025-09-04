'use client';

import React from 'react';

interface DetailNavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function DetailNavbar({ 
  title = "Applications & Verification",
  showBackButton = false,
  onBack = () => window.history.back()
}: DetailNavbarProps) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg 
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
    </div>
  );
}
