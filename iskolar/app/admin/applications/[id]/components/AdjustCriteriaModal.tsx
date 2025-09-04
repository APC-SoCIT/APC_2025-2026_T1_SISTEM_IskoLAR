'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CriteriaConfig {
  residency: {
    years: number;
    status: 'passed' | 'failed' | 'attention';
  };
  voter: {
    required: boolean;
    status: 'passed' | 'failed' | 'attention';
  };
  income: {
    threshold: number;
    status: 'passed' | 'failed' | 'attention';
  };
  age: {
    min: number;
    max: number;
    status: 'passed' | 'failed' | 'attention';
  };
  enrollment: {
    status: 'passed' | 'failed' | 'attention';
  };
  gpa: {
    minimum: number;
    status: 'passed' | 'failed' | 'attention';
  };
  units: {
    minimum: number;
    status: 'passed' | 'failed' | 'attention';
  };
  grades: {
    allowFailing: boolean;
    status: 'passed' | 'failed' | 'attention';
  };
}

export default function AdjustCriteriaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<CriteriaConfig>({
    residency: {
      years: 3,
      status: 'passed'
    },
    voter: {
      required: true,
      status: 'passed'
    },
    income: {
      threshold: 25000,
      status: 'attention'
    },
    age: {
      min: 16,
      max: 25,
      status: 'passed'
    },
    enrollment: {
      status: 'passed'
    },
    gpa: {
      minimum: 2.5,
      status: 'failed'
    },
    units: {
      minimum: 12,
      status: 'passed'
    },
    grades: {
      allowFailing: false,
      status: 'attention'
    }
  });

  const handleStatusChange = (
    criterionId: keyof CriteriaConfig,
    value: 'passed' | 'failed' | 'attention'
  ) => {
    setCriteria(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], status: value }
    }));
  };

  const handleNumericChange = (
    criterionId: keyof CriteriaConfig,
    field: string,
    value: number
  ) => {
    setCriteria(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], [field]: value }
    }));
  };

  const handleBooleanChange = (
    criterionId: keyof CriteriaConfig,
    field: string,
    value: boolean
  ) => {
    setCriteria(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], [field]: value }
    }));
  };

  const handleSave = () => {
    // Here you would typically save the changes to your backend
    console.log('Saving criteria changes:', criteria);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Adjust Criteria
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay with blur effect */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Adjust Eligibility Criteria
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* City Residency */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">City Residency</h3>
                      <p className="text-sm text-gray-500">Set minimum years of residency required</p>
                    </div>
                    <select
                      value={criteria.residency.status}
                      onChange={(e) => handleStatusChange('residency', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={criteria.residency.years}
                      onChange={(e) => handleNumericChange('residency', 'years', parseInt(e.target.value))}
                      min="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">years minimum residency</span>
                  </div>
                </div>

                {/* Voter Registration */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Voter Registration</h3>
                      <p className="text-sm text-gray-500">Set voter registration requirement</p>
                    </div>
                    <select
                      value={criteria.voter.status}
                      onChange={(e) => handleStatusChange('voter', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={criteria.voter.required}
                        onChange={(e) => handleBooleanChange('voter', 'required', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm text-gray-600">Required to be a registered voter</span>
                  </div>
                </div>

                {/* Family Income */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Family Income Threshold</h3>
                      <p className="text-sm text-gray-500">Set maximum monthly family income</p>
                    </div>
                    <select
                      value={criteria.income.status}
                      onChange={(e) => handleStatusChange('income', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">₱</span>
                    <input
                      type="number"
                      value={criteria.income.threshold}
                      onChange={(e) => handleNumericChange('income', 'threshold', parseInt(e.target.value))}
                      min="0"
                      step="1000"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">monthly family income</span>
                  </div>
                </div>

                {/* Age Requirement */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Age Requirement</h3>
                      <p className="text-sm text-gray-500">Set age range</p>
                    </div>
                    <select
                      value={criteria.age.status}
                      onChange={(e) => handleStatusChange('age', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={criteria.age.min}
                      onChange={(e) => handleNumericChange('age', 'min', parseInt(e.target.value))}
                      min="0"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">to</span>
                    <input
                      type="number"
                      value={criteria.age.max}
                      onChange={(e) => handleNumericChange('age', 'max', parseInt(e.target.value))}
                      min={criteria.age.min}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">years old</span>
                  </div>
                </div>

                {/* GPA Requirement */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">GPA Requirement</h3>
                      <p className="text-sm text-gray-500">Set minimum GPA required</p>
                    </div>
                    <select
                      value={criteria.gpa.status}
                      onChange={(e) => handleStatusChange('gpa', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={criteria.gpa.minimum}
                      onChange={(e) => handleNumericChange('gpa', 'minimum', parseFloat(e.target.value))}
                      min="0"
                      max="4"
                      step="0.1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">minimum GPA</span>
                  </div>
                </div>

                {/* Course Load */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Course Load</h3>
                      <p className="text-sm text-gray-500">Set minimum units required per semester</p>
                    </div>
                    <select
                      value={criteria.units.status}
                      onChange={(e) => handleStatusChange('units', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={criteria.units.minimum}
                      onChange={(e) => handleNumericChange('units', 'minimum', parseInt(e.target.value))}
                      min="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">minimum units</span>
                  </div>
                </div>

                {/* Academic Record */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Academic Record</h3>
                      <p className="text-sm text-gray-500">Set failing grades policy</p>
                    </div>
                    <select
                      value={criteria.grades.status}
                      onChange={(e) => handleStatusChange('grades', e.target.value as 'passed' | 'failed' | 'attention')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="attention">Attention Needed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={criteria.grades.allowFailing}
                        onChange={(e) => handleBooleanChange('grades', 'allowFailing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm text-gray-600">Allow failing grades in previous semester</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-4 p-4 border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
