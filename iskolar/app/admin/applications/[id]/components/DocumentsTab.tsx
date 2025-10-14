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
  const mockDocuments = {
    identity: [
      {
        name: 'Birth Certificate.pdf',
        uploadDate: 'Aug 15, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'ID Picture.jpg',
        uploadDate: 'Aug 16, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'Barangay ID.jpg',
        uploadDate: 'Aug 10, 2023',
        status: 'reupload',
        comments: 'Image is blurry'
      }
    ],
    academic: [
      {
        name: 'Transcript of Records.pdf',
        uploadDate: 'Aug 15, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'Diploma.pdf',
        uploadDate: 'Aug 10, 2023',
        status: 'reupload',
        comments: 'Image is blurry'
      },
      {
        name: 'Good Moral.pdf',
        uploadDate: 'Aug 16, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'Certificate of Registration.pdf',
        uploadDate: 'Aug 15, 2023',
        status: 'verified',
        comments: null
      }
    ],
    other: [
      {
        name: 'Certificate of Residency.pdf',
        uploadDate: 'Aug 15, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'Voter Certification (Self).pdf',
        uploadDate: 'Aug 16, 2023',
        status: 'verified',
        comments: null
      },
      {
        name: 'Voter Certification (Mother).pdf',
        uploadDate: 'Aug 16, 2023',
        status: 'missing',
        comments: null
      },
      {
        name: 'Voter Certification (Father).pdf',
        uploadDate: 'Aug 16, 2023',
        status: 'missing',
        comments: null
      },
      {
        name: 'Voter Certification (Guardian).pdf',
        uploadDate: 'Aug 16, 2023',
        status: 'missing',
        comments: null
      }
    ]
  };

  const getStatusBadge = (status: 'verified' | 'reupload' | 'missing') => {
    const styles = {
      verified: 'bg-green-50 text-green-700 border-green-200',
      reupload: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      missing: 'bg-red-50 text-red-700 border-red-200'
    };
    return styles[status];
  };

  const verifiedCount = Object.values(mockDocuments).flat().filter(doc => doc.status === 'verified').length;
  const reuploadCount = Object.values(mockDocuments).flat().filter(doc => doc.status === 'reupload').length;
  const missingCount = Object.values(mockDocuments).flat().filter(doc => doc.status === 'missing').length;

  mockDocuments.identity.forEach(doc => {
    if (!['verified', 'reupload', 'missing'].includes(doc.status)) {
      throw new Error(`Unexpected status: ${doc.status}`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
          <p className="text-sm text-gray-600">All applicants must submit the required documents for verification.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Request Documents</button>
      </div>

      {/* Document Upload Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">Verified</span>
          <span>{verifiedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Needs Re-upload</span>
          <span>{reuploadCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">Missing/Denied</span>
          <span>{missingCount}</span>
        </div>
      </div>

      {/* Document Categories */}
      {Object.entries(mockDocuments).map(([category, documents]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 capitalize">{category} Documents</h3>
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                <p className="text-sm text-gray-600">Uploaded on {doc.uploadDate}</p>
                {doc.comments && <p className="text-xs text-yellow-700">{doc.comments}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(doc.status as 'verified' | 'reupload' | 'missing')}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                <button className="text-blue-600 hover:underline">View</button>
                <button className="text-gray-600 hover:underline">Download</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
