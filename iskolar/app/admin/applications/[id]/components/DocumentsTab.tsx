'use client';

import React, { useState } from 'react';
import { FiSearch, FiDownload, FiEye, FiTrash2, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';
import RequestDocumentsModal from './RequestDocumentsModal';

export interface DocumentData {
  name: string;
  type: 'Identity' | 'Academic' | 'Other';
  fileType: 'pdf' | 'jpg' | 'png';
  status: 'verified' | 'reupload' | 'denied';
  uploadDate: string;
  note?: string;
}

export default function DocumentsTab() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>(() => [
    // Identity Documents
    {
      name: 'Birth Certificate.pdf',
      type: 'Identity',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 15, 2023'
    },
    {
      name: 'ID Picture.jpg',
      type: 'Identity',
      fileType: 'jpg',
      status: 'verified',
      uploadDate: 'Aug 16, 2023'
    },
    {
      name: 'Barangay ID.jpg',
      type: 'Identity',
      fileType: 'jpg',
      status: 'reupload',
      uploadDate: 'Aug 10, 2023',
      note: 'Image is blurry'
    },
    // Academic Documents
    {
      name: 'Transcript of Records.pdf',
      type: 'Academic',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 15, 2023'
    },
    {
      name: 'Good Moral.pdf',
      type: 'Academic',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 16, 2023'
    },
    {
      name: 'Diploma.pdf',
      type: 'Academic',
      fileType: 'pdf',
      status: 'reupload',
      uploadDate: 'Aug 10, 2023',
      note: 'Image is blurry'
    },
    {
      name: 'Certificate of Registration.pdf',
      type: 'Academic',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 15, 2023'
    },
    // Other Requirements
    {
      name: 'Medical Certificate.pdf',
      type: 'Other',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 15, 2023'
    },
    {
      name: 'Recommendation Letter.pdf',
      type: 'Other',
      fileType: 'pdf',
      status: 'verified',
      uploadDate: 'Aug 16, 2023'
    },
    {
      name: 'Barangay Diploma.pdf',
      type: 'Other',
      fileType: 'pdf',
      status: 'denied',
      uploadDate: 'Aug 10, 2023',
      note: 'Image is blurry'
    }
  ]);

  const updateDocumentStatus = (type: string, index: number, newStatus: DocumentData['status']) => {
    setDocuments(prevDocs => {
      const updatedDocs = [...prevDocs];
      const docIndex = prevDocs.findIndex((doc, i) => doc.type === type && i === index);
      if (docIndex !== -1) {
        updatedDocs[docIndex] = { ...updatedDocs[docIndex], status: newStatus };
      }
      return updatedDocs;
    });
  };

  const getStatusConfig = (status: DocumentData['status']) => {
    const configs = {
      verified: {
        style: 'bg-green-50 text-[#4CAF50] border-green-100',
        icon: (
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="3"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ),
        text: 'Verified'
      },
      reupload: {
        style: 'bg-yellow-50 text-[#FFC107] border-yellow-100',
        icon: (
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="3"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ),
        text: 'Needs Re-upload'
      },
      denied: {
        style: 'bg-red-50 text-[#F44336] border-red-100',
        icon: (
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="3"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ),
        text: 'Missing/Denied'
      }
    };
    return configs[status];
  };

  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<DocumentData['type'], DocumentData[]>);

  const stats = documents.reduce((acc, doc) => {
    acc[doc.status]++;
    return acc;
  }, { verified: 0, reupload: 0, denied: 0 });

  return (
    <div className="space-y-6">
      {/* Request Documents Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          Request Documents
        </button>
      </div>

      {/* Info Banner */}
      
      <RequestDocumentsModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
      <div className="p-4 bg-[#E3F2FD] rounded-lg flex items-start gap-3">
        <FiAlertTriangle className="w-5 h-5 text-black mt-0.5" />
        <p className="text-sm text-gray-900">
          All applicants must submit the required documents for verification. Documents marked with ▲ need to be re-uploaded due to quality issues or incompleteness.
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 flex justify-around">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#4CAF50] bg-opacity-10 flex items-center justify-center mx-auto mb-2">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-[#4CAF50]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-600">Verified</div>
          <div className="text-3xl font-bold text-[#4CAF50]">{stats.verified}</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFC107] bg-opacity-10 flex items-center justify-center mx-auto mb-2">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-[#FFC107]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-600">Needs Re-upload</div>
          <div className="text-3xl font-bold text-[#FFC107]">{stats.reupload}</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#F44336] bg-opacity-10 flex items-center justify-center mx-auto mb-2">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-[#F44336]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-600">Missing/Denied</div>
          <div className="text-3xl font-bold text-[#F44336]">{stats.denied}</div>
        </div>
      </div>

      {/* Document Sections */}
      {(['Identity', 'Academic', 'Other'] as const).map(type => (
        <div key={type} className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{type} Documents</h2>
          <div className="space-y-4">
            {documentsByType[type]?.map((doc, index) => {
              const statusConfig = getStatusConfig(doc.status);
              return (
                <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {doc.fileType === 'pdf' ? (
                        <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h3v3h-3v-3zm0-5.5h3v3h-3V6zM5 19V5h14l.002 14H5z"/>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0-2-.9-2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-xs text-gray-500">Uploaded on {doc.uploadDate}</p>
                        {doc.note && (
                          <p className="text-xs text-gray-500 mt-1">{doc.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `${type}-${index}` ? null : `${type}-${index}`)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${statusConfig.style}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.text}
                        <svg className={`w-4 h-4 ml-1 transform transition-transform ${openDropdown === `${type}-${index}` ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {openDropdown === `${type}-${index}` && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                updateDocumentStatus(type, index, 'verified');
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Verified
                            </button>
                            <button
                              onClick={() => {
                                updateDocumentStatus(type, index, 'reupload');
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Request Re-upload
                            </button>
                            <button
                              onClick={() => {
                                updateDocumentStatus(type, index, 'denied');
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Missing/Denied
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <button className="p-1 hover:text-gray-600">
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button className="p-1 hover:text-gray-600">
                        <FiDownload className="w-5 h-5" />
                      </button>
                      <button className="p-1 hover:text-gray-600">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
