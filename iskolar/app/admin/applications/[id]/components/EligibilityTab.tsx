'use client';

import React from 'react';
import AdjustCriteriaModal from './AdjustCriteriaModal';

interface CriteriaItem {
  icon: string;
  title: string;
  description: string;
  status: 'passed' | 'attention' | 'failed';
}

const personalCriteria: CriteriaItem[] = [
  {
    icon: '🏠',
    title: 'Taguig City Residency',
    description: 'Minimum 3 years of residency required',
    status: 'passed'
  },
  {
    icon: '🗳️',
    title: 'Voter Registration Status',
    description: 'Registered voter in Taguig City',
    status: 'passed'
  },
  {
    icon: '💰',
    title: 'Family Income Threshold',
    description: 'Below ₱25,000 monthly family income',
    status: 'attention'
  },
  {
    icon: '📅',
    title: 'Age Requirement',
    description: 'Between 16–25 years old',
    status: 'passed'
  }
];

const academicCriteria: CriteriaItem[] = [
  {
    icon: '📚',
    title: 'Enrollment Status',
    description: 'Currently enrolled in accredited institution',
    status: 'passed'
  },
  {
    icon: '📊',
    title: 'GPA Requirement',
    description: 'Minimum GPA of 2.5 or equivalent',
    status: 'failed'
  },
  {
    icon: '📝',
    title: 'Full-time Course Load',
    description: 'Minimum 12 units per semester',
    status: 'passed'
  },
  {
    icon: '📋',
    title: 'Previous Academic Record',
    description: 'No failing grades in previous semester',
    status: 'attention'
  }
];

export default function EligibilityTab() {
  return (
    <div>
      {/* Page Title Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Eligibility Criteria</h1>
          <AdjustCriteriaModal />
        </div>
        <p className="text-gray-600">
          Verify the applicant meets all required eligibility criteria for the Taguig City Scholarship Program.
        </p>
      </div>

      {/* Criteria Sections */}
      <div className="space-y-8">
        {/* Personal Information Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            {personalCriteria.map((criteria, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">{criteria.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{criteria.title}</h3>
                    <p className="text-sm text-gray-500">{criteria.description}</p>
                  </div>
                </div>
                <div>
                  {criteria.status === 'passed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                      ✅ Passed
                    </span>
                  )}
                  {criteria.status === 'attention' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                      ⚠️ Attention Needed
                    </span>
                  )}
                  {criteria.status === 'failed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                      ❌ Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Requirements Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Requirements</h2>
          <div className="space-y-4">
            {academicCriteria.map((criteria, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">{criteria.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{criteria.title}</h3>
                    <p className="text-sm text-gray-500">{criteria.description}</p>
                  </div>
                </div>
                <div>
                  {criteria.status === 'passed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                      ✅ Passed
                    </span>
                  )}
                  {criteria.status === 'attention' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                      ⚠️ Attention Needed
                    </span>
                  )}
                  {criteria.status === 'failed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                      ❌ Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions Section */}
        <section className="mt-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verification Actions
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white 
                                 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow
                                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Eligibility
                </button>
                <button className="inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white 
                                 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow
                                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Mark as Ineligible
                </button>
              </div>
              <button className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-yellow-500 text-white 
                               rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-sm hover:shadow
                               focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Request Additional Documents
              </button>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add comment with action
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 bg-white
                           placeholder-gray-400 resize-none transition-all duration-200"
                  placeholder="Enter your review comments or additional notes..."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
