import React from 'react';
import Link from 'next/link';
import { Application } from '@/lib/types/user';

interface RecentApplicationProps {
  applications: (Application & {
    name: string;
    barangay: string;
  })[];
  isLoading?: boolean;
}

const statusStyles = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  submitted: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  under_review: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  approved: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  withdrawn: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' }
};

export default function RecentApplications({ applications, isLoading }: RecentApplicationProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm animate-pulse">
        <div className="h-16 bg-gray-100"></div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
          <Link 
            href="/admin/applications/all"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All Applications →
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {applications.map((application) => {
          const status = statusStyles[application.status];
          return (
            <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {application.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border}`}
                    >
                      {application.status.replace('_', ' ').charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    From: {application.barangay} • Submitted: {new Date(application.created_at || '').toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/admin/applications/${application.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Review Application →
                </Link>
              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No recent applications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}