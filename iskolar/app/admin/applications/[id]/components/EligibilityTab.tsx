'use client';

import React from 'react';

export interface ApplicantEligibilityData {
  // We'll expand this interface later with actual eligibility criteria
  residency: {
    status: string;
    verificationDate?: string;
    documents: string[];
  };
  voter: {
    status: string;
    verificationDate?: string;
    precinct?: string;
  };
  academic: {
    gpa: string;
    yearLevel: string;
    program: string;
  };
}

export default function EligibilityTab() {
  // Mock data for eligibility criteria
  const mockData = {
    id: 'SKID-2025-001',
    status: 'Under Review',
    criteria: {
      personal: [
        {
          name: 'Taguig City Residency',
          requirement: 'Minimum 3 years of residency required',
          status: 'passed'
        },
        {
          name: 'Voter Registration Status',
          requirement: 'Registered voter in Taguig City',
          status: 'passed'
        },
        {
          name: 'Family Income Threshold',
          requirement: 'Below ₱42,000 monthly family income',
          status: 'attention'
        },
        {
          name: 'Age Requirement',
          requirement: 'Between 15-22 years old',
          status: 'passed'
        }
      ],
      academic: [
        {
          name: 'Enrollment Status',
          requirement: 'Currently enrolled in accredited institution',
          status: 'passed'
        },
        {
          name: 'GPA Requirement',
          requirement: 'Minimum GPA of 2.5 or equivalent',
          status: 'failed'
        },
        {
          name: 'Full-time Course Load',
          requirement: 'Minimum 12 units per semester',
          status: 'passed'
        },
        {
          name: 'Previous Academic Record',
          requirement: 'No failing grades in previous semester',
          status: 'attention'
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Application ID */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900">Eligibility Criteria</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verify the applicant meets all required eligibility criteria for the Taguig City Scholarship Program.
          </p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
        <div className="space-y-4">
          {mockData.criteria.personal.map((criterion, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{criterion.name}</h4>
                <p className="text-sm text-gray-600">{criterion.requirement}</p>
              </div>
              <div>
                {criterion.status === 'passed' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    ✓ Passed
                  </span>
                )}
                {criterion.status === 'failed' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                    ✕ Failed
                  </span>
                )}
                {criterion.status === 'attention' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    ⚠ Attention Needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Requirements Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800">Academic Requirements</h3>
        <div className="space-y-4">
          {mockData.criteria.academic.map((criterion, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{criterion.name}</h4>
                <p className="text-sm text-gray-600">{criterion.requirement}</p>
              </div>
              <div>
                {criterion.status === 'passed' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    ✓ Passed
                  </span>
                )}
                {criterion.status === 'failed' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                    ✕ Failed
                  </span>
                )}
                {criterion.status === 'attention' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    ⚠ Attention Needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
