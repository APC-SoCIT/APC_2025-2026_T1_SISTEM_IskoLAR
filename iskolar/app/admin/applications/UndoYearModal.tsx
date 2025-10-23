'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UndoYearModalProps {
  schoolYear: {
    id: string;
    academic_year: number;
  };
  onClose: () => void;
  onUndo: () => void | Promise<void>;
}

type FormError = {
  field?: string;
  message: string;
} | null;

export default function UndoYearModal({ schoolYear, onClose, onUndo }: UndoYearModalProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError({ message: 'You must be logged in to perform this action' });
        return;
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

      if (adminError || !adminData || !adminData.role) {
        setError({ message: 'Unauthorized. Super admin access required.' });
        return;
      }

      const roleName = Array.isArray(adminData.role) ? adminData.role[0]?.name : (adminData.role as any).name;
      if (roleName !== 'super_admin') {
        setError({ message: 'Unauthorized. Super admin access required.' });
        return;
      }

      if (!adminPassword) {
        setError({ field: 'password', message: 'Admin password is required' });
        return;
      }

      // Call the server endpoint to delete/undo the academic year
      const res = await fetch(`/api/admin/school-years/${schoolYear.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: session.user.email, adminPassword })
      });

      const payload = await res.json();
      if (!res.ok) {
        setError({ message: payload.error || 'Failed to undo academic year' });
        setSubmitStatus('');
        return;
      }

      setSubmitStatus('Success! Refreshing page...');
      await onUndo();
      
      // Brief delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error: any) {
      console.error('Error undoing school year:', error);
      setError({ message: error.message || 'Failed to undo academic year. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Undo Academic Year Creation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && !error.field && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error.message}
            </div>
          )}
          
          {submitStatus && (
            <div className="p-3 text-sm text-blue-600 bg-blue-50 rounded-lg">
              {submitStatus}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              You are about to undo the creation of A.Y. {schoolYear.academic_year}-{schoolYear.academic_year + 1}. This will permanently delete this academic year and any associated data. This action can only be performed within 24 hours of creation.
            </p>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Confirm Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setError(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error?.field === 'password'
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                required
              />
              {error?.field === 'password' && (
                <p className="text-sm text-red-600">{error.message}</p>
              )}
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Undoing...' : 'Undo Creation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}