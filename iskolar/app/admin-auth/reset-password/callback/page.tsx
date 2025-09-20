'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash;
        if (!hashFragment) {
          throw new Error('No reset token found in URL');
        }

        // Parse the access_token from the hash
        const params = new URLSearchParams(hashFragment.substring(1));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          throw new Error('No access token found in URL');
        }

        // Set the new session
        const { data: { user }, error: sessionError } = await supabase.auth.getUser(accessToken);

        if (sessionError || !user) {
          throw new Error(sessionError?.message || 'Failed to validate reset token');
        }

        // Redirect to the password reset page
        router.push('/admin-auth/reset-password/new');
      } catch (err: any) {
        console.error('Error handling password reset:', err);
        setError(err.message || 'Failed to process password reset request');
      }
    };

    handlePasswordReset();
  }, [router, supabase.auth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your password reset request...</p>
      </div>
    </div>
  );
}
