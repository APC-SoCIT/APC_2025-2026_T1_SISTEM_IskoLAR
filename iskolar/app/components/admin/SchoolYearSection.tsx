import React, { useState } from 'react';
import { SchoolYear } from '@/lib/types/school-year';

interface SchoolYearSectionProps {
  schoolYears: SchoolYear[];
  onAddYear: () => void;
}

export default function SchoolYearSection({ schoolYears, onAddYear }: SchoolYearSectionProps) {
  const [showPreviousYears, setShowPreviousYears] = useState(false);
  const currentYear = schoolYears.find(y => y.isCurrent);
  const previousYears = schoolYears.filter(y => !y.isCurrent);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">School Year Management</h2>
          <button
            onClick={onAddYear}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add School Year
          </button>
        </div>
      </div>
      
      <div className="px-6 py-4">
        {/* Current Year */}
        {currentYear && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Current Academic Year</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-800">
                    A.Y. {currentYear.academic_year} - {currentYear.academic_year + 1}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current Year
                  </span>
                </div>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => window.location.href = `/admin/applications/school-year/${currentYear.id}`}
                >
                  Manage →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Previous Years */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Previous Years</h3>
            <button
              onClick={() => setShowPreviousYears(!showPreviousYears)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showPreviousYears ? 'Hide' : 'Show'} Previous Years
            </button>
          </div>

          {showPreviousYears && (
            <div className="space-y-3">
              {previousYears.map((year) => (
                <div 
                  key={year.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      A.Y. {year.academic_year} - {year.academic_year + 1}
                    </span>
                    <button 
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => window.location.href = `/admin/applications/school-year/${year.id}`}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}