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
  // This is a placeholder that we'll enhance later
  const mockData: ApplicantEligibilityData = {
    residency: {
      status: 'Verified',
      verificationDate: '2025-08-15',
      documents: ['Barangay Certificate', 'Utility Bill']
    },
    voter: {
      status: 'Verified',
      verificationDate: '2025-08-15',
      precinct: 'Precinct 123'
    },
    academic: {
      gpa: '3.8',
      yearLevel: '3rd Year',
      program: 'BSCS'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Eligibility Requirements</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and verify applicant&apos;s eligibility criteria
        </p>
      </div>

      {/* Eligibility Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Residency Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Residency Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                {mockData.residency.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification Date</span>
              <span className="text-gray-900">{mockData.residency.verificationDate}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-2">Supporting Documents</span>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {mockData.residency.documents.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Voter Status Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Voter Registration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                {mockData.voter.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification Date</span>
              <span className="text-gray-900">{mockData.voter.verificationDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Precinct Number</span>
              <span className="text-gray-900">{mockData.voter.precinct}</span>
            </div>
          </div>
        </div>

        {/* Academic Requirements */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Requirements</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">GPA</span>
              <span className="text-gray-900">{mockData.academic.gpa}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Year Level</span>
              <span className="text-gray-900">{mockData.academic.yearLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Program</span>
              <span className="text-gray-900">{mockData.academic.program}</span>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Actions</h3>
          <div className="space-y-4">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Approve Eligibility
            </button>
            <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
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
      </div>
    </div>
  );
}
