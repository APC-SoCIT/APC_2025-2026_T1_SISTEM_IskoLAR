'use client';

import React from 'react';

export interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'internal' | 'external';
  status?: 'pending' | 'resolved';
}

export default function NotesTab() {
  // This is a placeholder that we'll enhance later
  const mockNotes: Note[] = [
    {
      id: '1',
      author: 'Admin User',
      content: 'Requested additional documentation for proof of residency.',
      timestamp: '2025-08-17 14:30',
      type: 'internal',
      status: 'pending'
    },
    {
      id: '2',
      author: 'System',
      content: 'Academic records verified automatically.',
      timestamp: '2025-08-16 09:15',
      type: 'internal',
      status: 'resolved'
    },
    {
      id: '3',
      author: 'Juan Dela Cruz',
      content: 'Submitted updated grade report as requested.',
      timestamp: '2025-08-15 16:45',
      type: 'external',
      status: 'resolved'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Application Notes</h2>
        <p className="text-sm text-gray-500 mt-1">
          View and manage notes and communications related to this application
        </p>
      </div>

      {/* Add New Note */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Note</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="internal">Internal Note</option>
              <option value="external">External Communication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your note here..."
            />
          </div>
          <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Note
          </button>
        </div>
      </div>

      {/* Notes Timeline */}
      <div className="space-y-4">
        {mockNotes.map((note) => (
          <div key={note.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{note.author}</span>
                  <span className="text-sm text-gray-500">{note.timestamp}</span>
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1
                  ${note.type === 'internal' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-blue-100 text-blue-700'}`}>
                  {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                </span>
              </div>
              {note.status && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${note.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                </span>
              )}
            </div>
            <p className="text-gray-700">{note.content}</p>
            {note.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Mark as Resolved
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="all">All Notes</option>
              <option value="internal">Internal Only</option>
              <option value="external">External Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
