'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AddYearModalProps {
  onClose: () => void;
  onAdd: (newYear: { id: string; year: number }) => void;
}

export default function AddYearModal({ onClose, onAdd }: AddYearModalProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to perform this action');
      }

      // First verify super_admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select(`
          email_address,
          role:role!role_id (
            name
          )
        `)
        .eq('email_address', session.user.email)
        .single();

      if (adminError || !adminData || !adminData.role || adminData.role.name !== 'super_admin') {
        throw new Error('Unauthorized. Super admin access required.');
      }

      const { data: newYear, error: insertError } = await supabase
        .from('school_years')
        .insert([{ academic_year: year }])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Failed to create school year');
      }

      onAdd(newYear);
      onClose();
    } catch (error: any) {
      console.error('Error creating school year:', error);
      alert(error.message || 'Failed to create school year. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Academic Year
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              School Year Start
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min={2020}
              max={2050}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This will create the academic year {year} - {year + 1}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Year'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}