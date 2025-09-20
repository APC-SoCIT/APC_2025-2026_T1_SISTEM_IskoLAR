'use client';

import React from 'react';

export interface DocumentData {
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected' | 'reupload';
  uploadDate: string;
  lastChecked?: string;
  comments?: string;
}

export default function DocumentsTab() {
  // This is a placeholder that we'll enhance later
  const mockDocuments: DocumentData[] = [
    {
      name: 'Birth Certificate',
      type: 'Identification',
      status: 'verified',
      uploadDate: '2025-08-15',
      lastChecked: '2025-08-16'
    },
    {
      name: 'Grade Report',
      type: 'Academic',
      status: 'reupload',
      uploadDate: '2025-08-15',
      lastChecked: '2025-08-16',
      comments: 'Please provide official copy with school seal'
    },
    {
      name: 'Barangay Certificate',
      type: 'Residency',
      status: 'pending',
      uploadDate: '2025-08-15'
    }
  ];

  const getStatusBadgeStyle = (status: DocumentData['status']) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      verified: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      reupload: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return styles[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and verify submitted documents
        </p>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {mockDocuments.map((doc, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                <p className="text-sm text-gray-500">{doc.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeStyle(doc.status)}`}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Upload Date:</span>
                <span className="ml-2 text-gray-900">{doc.uploadDate}</span>
              </div>
              {doc.lastChecked && (
                <div>
                  <span className="text-gray-500">Last Checked:</span>
                  <span className="ml-2 text-gray-900">{doc.lastChecked}</span>
                </div>
              )}
            </div>

            {doc.comments && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Comments:</p>
                {doc.comments}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Document
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Request Re-upload
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload New Document Section */}
      <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Select document type...</option>
              <option>Birth Certificate</option>
              <option>Grade Report</option>
              <option>Barangay Certificate</option>
            </select>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600">Drag and drop your files here, or click to select files</p>
            <button className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700">
              Select Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
