'use client';

import { useState, useEffect } from 'react';
import AdminNavbar from '@/app/components/admin/AdminNavbar';
import SchoolYearSection from '@/app/components/admin/SchoolYearSection';
import { SchoolYear } from '@/lib/types/school-year';
import AddYearModal from './AddYearModal';

export default function ApplicationsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [showAddYearModal, setShowAddYearModal] = useState(false);

  // Fetch school years
  useEffect(() => {
    async function fetchSchoolYears() {
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
    }

    fetchSchoolYears();
  }, []);

  const handleAddYear = () => {
    setShowAddYearModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminNavbar />
      
      <main className="p-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* School Year Section */}
          <SchoolYearSection 
            schoolYears={schoolYears}
            onAddYear={handleAddYear}
          />
        </div>
      </main>

      {/* Add Year Modal */}
      {showAddYearModal && (
        <AddYearModal
          onClose={() => setShowAddYearModal(false)}
          onAdd={(newYear) => {
            // Convert the new year format to match SchoolYear type
            const schoolYear: SchoolYear = {
              id: newYear.id,
              academic_year: newYear.year,
              created_at: new Date().toISOString(),
              semesters: []
            };
            setSchoolYears((prev) => [...prev, schoolYear]);
            setShowAddYearModal(false);
          }}
        />
      )}
    </div>
  );
}
