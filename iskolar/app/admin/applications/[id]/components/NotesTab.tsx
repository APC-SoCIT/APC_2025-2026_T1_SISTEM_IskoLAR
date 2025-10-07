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
  const mockNotes = [
    {
      id: '1',
      author: 'Admin L. Cruz',
      timestamp: 'Aug 15, 2025 – 09:30 AM',
      category: 'Documents',
      status: 'Pending',
      content: 'Still missing Good Moral doc. Waiting for re-upload. Applicant has been notified via email to submit the missing document within 3 days.',
      attachment: null
    },
    {
      id: '2',
      author: 'Admin A. Reyes',
      timestamp: 'Aug 13, 2025 – 02:15 PM',
      category: 'Eligibility',
      status: 'Resolved',
      content: 'Voter status verified via barangay clearance. Document shows registration in Barangay Upper Bicutan, Taguig City which meets the residency requirement for the scholarship program.',
      attachment: null
    },
    {
      id: '3',
      author: 'Admin J. Santos',
      timestamp: 'Aug 12, 2025 – 10:45 AM',
      category: 'Academic',
      status: 'Urgent',
      content: 'Confirmed GPA discrepancy; asked for updated transcript. The submitted transcript shows a GPA of 1.75 but the application form states 1.25. Need to verify if this is a clerical error or misrepresentation.',
      attachment: 'transcript_comparison.pdf'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Add New Note Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h3>
        <div className="space-y-4">
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your note here..."
            maxLength={500}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0/500 characters</span>
          </div>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option>Select a category...</option>
            <option>Documents</option>
            <option>Eligibility</option>
            <option>Academic</option>
          </select>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="Pending" className="form-radio" /> Pending
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="Resolved" className="form-radio" /> Resolved
            </label>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Note</button>
        </div>
      </div>

      {/* Notes Timeline */}
      <div className="space-y-4">
        {mockNotes.map((note) => (
          <div key={note.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                  {note.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{note.author}</p>
                  <p className="text-sm text-gray-500">{note.timestamp}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${note.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}
                ${note.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                ${note.status === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' : ''}`}>
                {note.status}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{note.content}</p>
            {note.attachment && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span className="material-icons">attachment</span>
                <a href="#" className="hover:underline">{note.attachment}</a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter and Search Options */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search notes..."
        />
        <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Filter</button>
      </div>
    </div>
  );
}
