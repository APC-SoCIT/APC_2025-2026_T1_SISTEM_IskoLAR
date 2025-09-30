'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(data.message || 'If an account exists with this email, a password reset link will be sent.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e3f0ff] via-[#f5f7fa] to-[#e3f0ff] py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Reset Password</h2>
        <p className="text-gray-500 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path stroke="#9ca3af" strokeWidth="2" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/>
                  <path stroke="#9ca3af" strokeWidth="2" d="m4 7 8 6 8-6"/>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                placeholder="admin@iskolar.taguig.ph"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-lg shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={() => router.push('/admin-auth/signin')}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-lg shadow hover:bg-gray-50 transition"
          >
            Back to Login
          </button>
        </form>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-xs text-gray-400">© 2025 IskoLAR</div>
    </div>
  );
}