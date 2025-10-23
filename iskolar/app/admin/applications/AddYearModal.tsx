'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AddYearModalProps {
  onClose: () => void;
  onAdd: () => void | Promise<void>;
}

type FormError = {
  field?: string;
  message: string;
} | null;

export default function AddYearModal({ onClose, onAdd }: AddYearModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError({ field: 'confirm', message: 'Please confirm the action first' });
      return;
    }
    if (!adminPassword) {
      setError({ field: 'password', message: 'Admin password is required' });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitStatus('Verifying session...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('Session error:', sessionError);
        setError({ message: 'You must be logged in to perform this action' });
        return;
      }

      setSubmitStatus('Verifying admin status...');
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
        setIsSubmitting(false);
        return;
      }

      // role can be returned as an array when using the role:role!role_id join syntax
      const roleName = Array.isArray(adminData.role) ? adminData.role[0]?.name : (adminData.role as any).name;
      if (roleName !== 'super_admin') {
        setError({ message: 'Unauthorized. Super admin access required.' });
        setIsSubmitting(false);
        return;
      }

      setSubmitStatus('Creating new academic year...');
      try {
        console.log('Making POST request to create school year...', {
          email: session.user.email,
          hasPassword: !!adminPassword
        });
        
        const res = await fetch('/api/admin/school-years', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminEmail: session.user.email, adminPassword }),
          signal: controller.signal
        });
        
        console.log('Received response:', res.status);
        clearTimeout(timeoutId);

        const payload = await res.json();
        console.log('Response payload:', payload);
        
        if (!res.ok) {
          let errorMessage = payload.error || 'Failed to create academic year';
          console.error('Error response:', { status: res.status, error: errorMessage, details: payload });
          
          // Handle specific error cases
          if (res.status === 403) {
            if (payload.error === 'Invalid password') {
              setError({ field: 'password', message: 'Incorrect password' });
            } else {
              setError({ message: 'You do not have permission to create academic years' });
            }
            setSubmitStatus('');
            return;
          }
          
          setError({ message: errorMessage });
          setSubmitStatus('');
          return;
        }
        
        // Success case
        console.log('Successfully created school year:', payload);
        setSubmitStatus('Success! Refreshing page...');

        await onAdd();
        onClose();
      } catch (requestError: any) {
        console.error('Request error:', requestError);
        if (requestError.name === 'AbortError') {
          setError({ message: 'Request timed out after 30 seconds. Please try again.' });
        } else {
          setError({ message: 'Network error. Please check your connection and try again.' });
        }
        setSubmitStatus('');
      }
    } catch (error: any) {
      console.error('Error creating school year:', error);
      setError({ message: error.message || 'Failed to create academic year. Please try again.' });
    } finally {
      clearTimeout(timeoutId);
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
          {error && !error.field && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error.message}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Clicking "Add Academic Year" will create the next academic year automatically (first will be A.Y. 2025-2026). This action can only be undone within 24 hours, and the newly created academic year will be set as active.
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

            <div className="flex items-start gap-2">
              <input
                id="confirm"
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  setError(null);
                }}
                className={`mt-1 ${
                  error?.field === 'confirm'
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }`}
              />
              <div>
                <label htmlFor="confirm" className="text-sm text-gray-600">
                  I understand this action can only be undone within 24 hours and will set the new academic year as active.
                </label>
                {error?.field === 'confirm' && (
                  <p className="text-sm text-red-600 mt-1">{error.message}</p>
                )}
              </div>
            </div>
          </div>

          {submitStatus && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
              {submitStatus}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConfirmed || !adminPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Academic Year'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}