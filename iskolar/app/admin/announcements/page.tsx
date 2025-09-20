"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { BellIcon, ChevronDownIcon, MegaphoneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { DocumentMagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

type Announcement = { 
  id: string; 
  title: string; 
  content: string; 
  publishDate: string; 
  attachmentUrl?: string; 
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [ 
  { 
    id: '3', 
    title: 'New Scholarship Program for STEM Students', 
    content: `We are excited to launch a new scholarship for students pursuing degrees in Science, Technology, Engineering, and Mathematics. This program aims to support the next generation of innovators and leaders in these critical fields.\n\nKey Details:\n- Eligibility: 3rd and 4th-year university students.\n- Deadline: October 15, 2025\n- Link to apply is in the attachment.`, 
    publishDate: '2025-10-15', 
    attachmentUrl: 'https://example.com/stem-scholarship.pdf', 
  }, 
  { 
    id: '2', 
    title: 'Application Deadline Extended for Arts Scholarship', 
    content: 'The deadline for the annual Arts & Humanities scholarship has been extended to November 30, 2025. We encourage all eligible students to apply and showcase their creative talents.', 
    publishDate: '2025-09-18', 
  }, 
  { 
    id: '1', 
    title: 'Welcome to the Scholarship Portal', 
    content: 'All available scholarships and important dates will be posted here. Please check back regularly for updates and new opportunities.', 
    publishDate: '2025-09-01', 
    attachmentUrl: 'https://example.com/portal-guide.pdf', 
  }, 
];

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => { setNotification(null); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((ann) => ann.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.publishDate).getTime();
        const dateB = new Date(b.publishDate).getTime();
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
      });
  }, [announcements, searchQuery, sortOrder]);


  const handleOpenCreateModal = () => { setSelectedAnnouncement(null); setIsEditModalOpen(true); };
  const handleOpenViewModal = (announcement: Announcement) => { setSelectedAnnouncement(announcement); setIsViewModalOpen(true); };
  const handleOpenEditModal = (announcement: Announcement) => { setSelectedAnnouncement(announcement); setIsEditModalOpen(true); };
  const handleDeleteClick = (id: string) => { setAnnouncementToDelete(id); setIsConfirmOpen(true); };
  const handleSaveAnnouncement = (formData: Omit<Announcement, 'id'>) => { if (selectedAnnouncement) { setAnnouncements(announcements.map((ann) => ann.id === selectedAnnouncement.id ? { ...ann, ...formData } : ann)); setNotification({ message: 'Announcement updated successfully!', type: 'success' }); } else { const newAnnouncement: Announcement = { id: new Date().toISOString(), ...formData }; setAnnouncements([newAnnouncement, ...announcements]); setNotification({ message: 'Announcement created successfully!', type: 'success' }); } setIsEditModalOpen(false); };
  const handleConfirmDelete = () => { if (!announcementToDelete) return; setAnnouncements(announcements.filter((ann) => ann.id !== announcementToDelete)); setNotification({ message: 'Announcement deleted successfully!', type: 'success' }); setIsConfirmOpen(false); setAnnouncementToDelete(null); };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0"> <h1 className="text-2xl font-bold text-gray-900">Announcement Management</h1> <p className="mt-1 text-sm text-gray-500">Create, edit, and publish updates for users.</p> </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4"> <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"> <BellIcon className="h-6 w-6" /> <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span> </button> <button className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"> <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center"> <span className="text-white text-sm font-medium">AU</span> </div> <div className="text-left hidden lg:block"> <p className="text-sm font-medium text-gray-900">Admin User</p> <p className="text-xs text-gray-500">Administrator</p> </div> <ChevronDownIcon className="h-5 w-5 text-gray-400" /> </button> <div className="flex"> <button onClick={handleOpenCreateModal} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"> <MegaphoneIcon className="h-5 w-5 mr-2" /> <span>Create Announcement</span> </button> </div> </div>
        </div>
      </header>
      
      {notification && (<div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{notification.message}</div>)}

      <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row gap-4">
        <input type="text" placeholder="🔍 Search announcements by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
          <option value="latest">Sort by Latest</option>
          <option value="oldest">Sort by Oldest</option>
        </select>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? ( <p className="p-4 text-center text-gray-500">Loading announcements...</p> ) : 
        filteredAnnouncements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((ann) => (
              <div key={ann.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="flex-1 mb-4 sm:mb-0">
                    <p className="text-sm text-gray-500">{new Date(ann.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-xl font-semibold text-gray-900">{ann.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-1">{ann.content}</p>
                </div>
                <div className="flex-shrink-0 flex space-x-2 self-end sm:self-center">
                  <button onClick={() => handleOpenViewModal(ann)} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors" title="Preview Announcement">
                    <DocumentMagnifyingGlassIcon className="h-5 w-5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button onClick={() => handleOpenEditModal(ann)} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors" title="Edit Announcement">
                    <PencilSquareIcon className="h-5 w-5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={() => handleDeleteClick(ann.id)} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors" title="Delete Announcement">
                    <TrashIcon className="h-5 w-5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Announcements Found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new announcement.</p>
          </div>
        )}
      </div>

      <ViewAnnouncementModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} announcement={selectedAnnouncement} />
      <AnnouncementModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveAnnouncement} announcement={selectedAnnouncement} />
      <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirm Deletion" message="Are you sure you want to delete this announcement? This action cannot be undone." />
    </div>
  );
}

function ViewAnnouncementModal({ isOpen, onClose, announcement }: { isOpen: boolean; onClose: () => void; announcement: Announcement | null; }) {
  if (!isOpen || !announcement) return null;
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
  <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Announcement Details</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-gray-500 mb-2">{new Date(announcement.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
          {announcement.attachmentUrl && (<a href={announcement.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-6 inline-block">View Attachment</a>)}
        </div>
  <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button onClick={onClose} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Close</button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementModal({ isOpen, onClose, onSave, announcement }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Announcement, 'id'>) => void; announcement: Announcement | null; }) {
  const [formData, setFormData] = useState({ title: '', content: '', publishDate: '', attachmentUrl: '', });
  useEffect(() => { if (announcement) { setFormData({ title: announcement.title, content: announcement.content, publishDate: announcement.publishDate, attachmentUrl: announcement.attachmentUrl || '', }); } else { setFormData({ title: '', content: '', publishDate: new Date().toISOString().split('T')[0], attachmentUrl: '', }); } }, [announcement, isOpen]);
  if (!isOpen) return null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, attachmentUrl: formData.attachmentUrl || undefined, }); };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
  <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{announcement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label><input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
          <div><label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label><textarea name="content" id="content" rows={8} value={formData.content} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
          <div><label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Publish Date</label><input type="date" name="publishDate" id="publishDate" value={formData.publishDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
          <div><label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700">Attachment URL (Optional)</label><input type="url" name="attachmentUrl" id="attachmentUrl" placeholder="https://example.com/document.pdf" value={formData.attachmentUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
        </div>
  <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col">
  <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
  <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}