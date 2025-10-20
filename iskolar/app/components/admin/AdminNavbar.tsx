'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const [searchYear, setSearchYear] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchYear.trim()) {
      router.push(`/admin/applications/all?year=${encodeURIComponent(searchYear.trim())}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Application & Verification</h1>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="search"
                  placeholder="Search Academic Year..."
                  className="px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
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
        </div>
      </div>
    </nav>
  );
}