'use client';

import { useState, useEffect } from 'react';

import SchoolYearSection from '@/app/components/admin/SchoolYearSection';
import ApplicationsSection from '@/app/components/admin/ApplicationsSection';
import { SchoolYear } from '@/lib/types/school-year';
import AddYearModal from './AddYearModal';
import UndoYearModal from './UndoYearModal';
import BrandedLoader from '@/app/components/ui/BrandedLoader';
import { usePageGate } from '@/app/hooks/usePageGate';
import { timeAsync } from '@/lib/utils/performance';

export default function ApplicationsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [yearToUndo, setYearToUndo] = useState<SchoolYear | null>(null);
  
  const gate = usePageGate({ years: true, stats: true });

  // Fetch school years on mount
  useEffect(() => {
    (async () => {
      try {
        gate.setTaskLoading('years', true);
        await timeAsync('fetch-school-years', async () => {
          const response = await fetch('/api/admin/school-years');
          if (!response.ok) throw new Error('Failed to fetch school years');
          const data = await response.json();
          setSchoolYears(data);
        });
      } catch (error) {
        console.error('Error fetching school years:', error);
      } finally {
        gate.setTaskLoading('years', false);
      }
    })();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      gate.setTaskLoading('years', true);
      const response = await fetch('/api/admin/school-years');
      if (!response.ok) throw new Error('Failed to fetch school years');
      const data = await response.json();
      setSchoolYears(data);
    } catch (error) {
      console.error('Error fetching school years:', error);
    } finally {
      gate.setTaskLoading('years', false);
    }
  };

  const handleAddYear = () => {
    setShowAddYearModal(true);
  };

  const handleStatsLoadingChange = (loading: boolean) => {
    gate.setTaskLoading('stats', loading);
  };

  // Single unified loader - wait for both years AND stats to load
  if (!gate.allDone()) {
    return (
      <BrandedLoader 
        title="Loading Applications" 
        subtitle="Fetching school years and semester statistics…" 
      />
    );
  }

  return (
    <div className="px-10 pt-8 pb-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">Application and Verification</h1>
          <p className="text-sm text-gray-500">Manage and monitor scholarship applications.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search Academic Year..." 
              onChange={(e) => {
                // TODO: Implement search functionality
                console.log('Search:', e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" 
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 mt-11">
        {/* School Year Section */}
        <SchoolYearSection 
          schoolYears={schoolYears}
          isLoading={false}
          onAddYear={handleAddYear}
          onUndoYear={(id: string) => {
            const yearToUndo = schoolYears.find(y => y.id === id);
            if (yearToUndo) {
              setYearToUndo(yearToUndo);
            }
          }}
        />

        {/* Applications Section - Shows applications grouped by semester */}
        <ApplicationsSection 
          schoolYears={schoolYears}
          isLoading={false}
          onLoadingChange={handleStatsLoadingChange}
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
          onClose={() => setYearToUndo(null)}
          onUndo={async () => {
            gate.setTaskLoading('years', true);
            // Filter out the undone year locally
            setSchoolYears((prev) => prev.filter(y => y.id !== yearToUndo.id));
            setYearToUndo(null);
            // Then refresh the data
            await fetchSchoolYears();
          }}
        />
      )}
    </div>
  );
}
