'use client';

import React from 'react';

interface Filters {
  searchQuery: string;
  selectedStatuses: string[];
  selectedBarangay: string;
  dateRange: {
    from: string;
    to: string;
  };
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  onReset: () => void;
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function FilterModal({ isOpen, onClose, onApply, onReset, counts }: FilterModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedBarangay, setSelectedBarangay] = React.useState<string>('');
  const [dateRange, setDateRange] = React.useState({ from: '', to: '' });

  const barangays = [
    'Bagumbayan',
    'Bambang',
    'Calzada',
    'Central Bicutan',
    'Central Signal Village',
    'Fort Bonifacio',
    'Hagonoy',
    'Ibayo-Tipas',
    'Katuparan',
    'Ligid-Tipas',
    'Lower Bicutan',
    'Maharlika Village',
    'Napindan',
    'New Lower Bicutan',
    'North Daang Hari',
    'North Signal Village',
    'Palingon',
    'Pinagsama',
    'San Miguel',
    'Santa Ana',
    'South Daang Hari',
    'South Signal Village',
    'Tanyag',
    'Tuktukan',
    'Upper Bicutan',
    'Ususan',
    'Wawa',
    'Western Bicutan'
  ];

  const handleApply = () => {
    onApply({
      searchQuery,
      selectedStatuses,
      selectedBarangay,
      dateRange
    });
  };

  const handleDateShortcut = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 overflow-y-auto h-full w-full z-50 transition-all duration-300 ease-in-out">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-900">Filter Applications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 mt-4">
          {/* Search Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name or ID
            </label>
            <input
              type="text"
              placeholder="e.g., 2025-0001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Application Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Status
            </label>
            <div className="space-y-2">
              {[
                { label: 'Pending', count: counts.pending, color: 'yellow' },
                { label: 'Approved', count: counts.approved, color: 'green' },
                { label: 'Rejected', count: counts.rejected, color: 'red' }
              ].map((status) => (
                <label
                  key={status.label}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer
                           hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.label)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatuses([...selectedStatuses, status.label]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter(s => s !== status.label));
                        }
                      }}
                      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500`}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">{status.label}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-200`}>
                    {status.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Barangay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barangay
            </label>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Barangays</option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDateShortcut(7)}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
              >
                Last 7 days
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => handleDateShortcut(30)}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
              >
                Last 30 days
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => handleDateShortcut(365)}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
              >
                This Year
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-150"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 
                     transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-150"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
