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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Actions</h3>
            <div className="space-y-4">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Approve Eligibility
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Mark as Ineligible
              </button>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Comment
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about eligibility verification..."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
