'use client';

import { useState, useEffect } from 'react';

import SchoolYearSection from '@/app/components/admin/SchoolYearSection';
import { SchoolYear } from '@/lib/types/school-year';
import AddYearModal from './AddYearModal';
import UndoYearModal from './UndoYearModal';

export default function ApplicationsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [yearToUndo, setYearToUndo] = useState<SchoolYear | null>(null);

  // Fetch school years on mount
  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const response = await fetch('/api/admin/school-years');
      if (!response.ok) throw new Error('Failed to fetch school years');
      const data = await response.json();
      setSchoolYears(data);
    } catch (error) {
      console.error('Error fetching school years:', error);
    } finally {
      setIsLoadingYears(false);
    }
  };

  const handleAddYear = () => {
    setShowAddYearModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Application & Verification</h1>
          <p className="text-gray-600 mt-1">Manage scholarship applications and academic years</p>
        </div>
        <form className="relative">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <input
              type="search"
              placeholder="Search Academic Year..."
              className="px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                // TODO: Implement search functionality
                console.log('Search:', e.target.value);
              }}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-white border-l border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        {/* School Year Section */}
        <SchoolYearSection 
          schoolYears={schoolYears}
          isLoading={isLoadingYears}
          onAddYear={handleAddYear}
          onUndoYear={(id: string) => {
            const yearToUndo = schoolYears.find(y => y.id === id);
            if (yearToUndo) {
              setYearToUndo(yearToUndo);
            }
          }}
        />
      </div>

      {/* Add Year Modal */}
      {showAddYearModal && (
        <AddYearModal
          onClose={() => setShowAddYearModal(false)}
          onAdd={async () => {
            await fetchSchoolYears();
            setShowAddYearModal(false);
          }}
        />
      )}

      {/* Undo Year Modal */}
      {yearToUndo && (
        <UndoYearModal 
          schoolYear={yearToUndo}
          onClose={() => {
            setYearToUndo(null);
          }}
          onUndo={async () => {
            setIsLoadingYears(true);
            await fetchSchoolYears();
            setYearToUndo(null);
          }}
        />
      )}

      {/* Undo Year Modal */}
      {yearToUndo && (
        <UndoYearModal
          schoolYear={yearToUndo}
          onClose={() => setYearToUndo(null)}
          onUndo={(id) => {
            setSchoolYears((prev) => prev.filter(y => y.id !== id));
            setYearToUndo(null);
          }}
        />
      )}
    </div>
  );
}
