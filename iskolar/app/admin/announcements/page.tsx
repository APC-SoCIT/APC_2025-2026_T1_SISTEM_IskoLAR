"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MegaphoneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---
type Announcement = { 
  announcements_id: string;  // Changed to match DB column name
  title: string; 
  content: string | null;    // Made nullable to match DB
  publish_date: string | null; // Made nullable to match DB
  file_path: string | null;    // Changed from attachment to file_path
  created_at: string;
  updated_at: string;         // Added updated_at from DB
};
type AnnouncementFormData = { title: string; content: string | null; publish_date: string | null; file_path?: File | null; };
interface AnnouncementFilters {
  dateRange: { from: string; to: string; };
  hasAttachment: 'yes' | 'no' | 'all';
}
// --- END TYPE DEFINITIONS ---

const isImage = (url: string) => /\.(jpeg|jpg|gif|png|svg)$/i.test(url);
const isPdf = (url: string) => /\.pdf$/i.test(url);

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AnnouncementFilters>({ dateRange: { from: '', to: '' }, hasAttachment: 'all' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAnnouncements = async () => { setIsLoading(true); try { const response = await fetch('/api/announcements'); if (!response.ok) throw new Error('API Error'); const data = await response.json(); setAnnouncements(data); } catch (error) { console.error(error); setNotification({ message: 'Failed to fetch announcements.', type: 'error' }); } finally { setIsLoading(false); } };
  useEffect(() => { fetchAnnouncements(); }, []);
  useEffect(() => { if (notification) { const timer = setTimeout(() => { setNotification(null); }, 3000); return () => clearTimeout(timer); } }, [notification]);

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((ann) => {
          const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesAttachment = filters.hasAttachment === 'all' || (filters.hasAttachment === 'yes' && ann.file_path) || (filters.hasAttachment === 'no' && !ann.file_path);
          let matchesDate = true;
          if (filters.dateRange.from && filters.dateRange.to) {
              const annDate = ann.publish_date ? new Date(ann.publish_date) : null;
              matchesDate = annDate ? annDate >= new Date(filters.dateRange.from) && annDate <= new Date(filters.dateRange.to) : false;
          }
          return matchesSearch && matchesAttachment && matchesDate;
      })
      .sort((a, b) => {
        const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
        const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
        return dateB - dateA;
      });
  }, [announcements, searchQuery, filters]);

  const handleApplyFilters = (newFilters: AnnouncementFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); };
  const handleResetFilters = () => { setFilters({ dateRange: { from: '', to: '' }, hasAttachment: 'all' }); setIsFilterModalOpen(false); };

  const handleOpenViewModal = (ann: Announcement) => { setSelectedAnnouncement(ann); setIsViewModalOpen(true); };
  const handleOpenEditModal = (ann: Announcement) => { setSelectedAnnouncement(ann); setIsEditModalOpen(true); };
  const handleOpenConfirm = (ann: Announcement) => { setSelectedAnnouncement(ann); setIsConfirmOpen(true); };
  const handleCloseModals = () => { setIsViewModalOpen(false); setIsEditModalOpen(false); setIsConfirmOpen(false); setSelectedAnnouncement(null); };

  const handleSaveAnnouncement = async (formData: AnnouncementFormData) => {
    const method = selectedAnnouncement ? 'PATCH' : 'POST';
    const endpoint = selectedAnnouncement ? `/api/announcements/${selectedAnnouncement.announcements_id}` : '/api/announcements';
    
    try { 
      console.log('Starting announcement save with data:', {
        title: formData.title,
        contentLength: formData.content?.length ?? 0,
        publish_date: formData.publish_date,
        hasFile: formData.file_path instanceof File
      });
      
      // Prepare form data with proper null handling
      const body = new FormData();
      
      // Required field - title should never be null or empty
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      body.append('title', formData.title.trim());
      
      // Optional fields with null handling
      if (formData.content?.trim()) {
        body.append('content', formData.content.trim());
      }
      
      if (formData.publish_date?.trim()) {
        body.append('publish_date', formData.publish_date.trim());
      }
      
      if (formData.file_path instanceof File) { 
        console.log('Appending file:', {
          name: formData.file_path.name,
          type: formData.file_path.type,
          size: formData.file_path.size
        });
        // Using 'file' as the field name to match the API expectation
        body.append('file', formData.file_path, formData.file_path.name);
      }
      
      console.log('Submitting form data:', {
        title: formData.title,
        content: formData.content,
        publish_date: formData.publish_date,
        hasFile: formData.file_path instanceof File
      });
      
      console.log('Making fetch request to:', endpoint, { method });
      
      const response = await fetch(endpoint, { 
        method,
        body 
      }); 

      console.log('Response status:', response.status);
      const data = await response.json().catch(e => {
        console.error('Failed to parse response JSON:', e);
        throw new Error('Invalid response from server');
      });
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('Server error details:', {
          status: response.status,
          statusText: response.statusText,
          data,
          error: data.error,
          details: data.details
        });
        
        const errorMessage = data.error 
          ? typeof data.error === 'string' 
            ? data.error 
            : JSON.stringify(data.error)
          : `Failed to save announcement: ${response.status} ${response.statusText}`;
        
        throw new Error(errorMessage);
      }
      
      setNotification({ 
        message: `Announcement ${selectedAnnouncement ? 'updated' : 'created'} successfully!`, 
        type: 'success' 
      }); 
      
      fetchAnnouncements(); 
      handleCloseModals();
    } catch (error) { 
      console.error('Error saving announcement:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }); 
      
      setNotification({ 
        message: error instanceof Error 
          ? error.message 
          : 'Failed to save announcement. Please check browser console for details.', 
        type: 'error' 
      }); 
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement?.announcements_id) return;
    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.announcements_id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete announcement');
      setNotification({ message: 'Announcement deleted successfully.', type: 'success' });
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Failed to delete announcement.', type: 'error' });
    }
    handleCloseModals();
  };

  return (
    <div className="px-6 pb-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">Announcement Management</h1>
          <p className="text-sm text-gray-500">Create, edit, and publish updates for users.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" 
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              <span className="px-2.5 py-0.5 text-sm bg-blue-100 text-blue-600 rounded-full">
                {filteredAnnouncements.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(true)} 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Announcement
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((ann) => (
                  <tr key={ann.announcements_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ann.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{ann.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {ann.publish_date ? 
                          new Date(ann.publish_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                          : 'Not scheduled'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenViewModal(ann)}
                        className="cursor-pointer text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(ann)}
                        className="cursor-pointer text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenConfirm(ann)}
                        className="cursor-pointer text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Announcements Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnnouncementFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} onReset={handleResetFilters} initialFilters={filters} />
      <ViewAnnouncementModal isOpen={isViewModalOpen} onClose={handleCloseModals} announcement={selectedAnnouncement} />
      <AnnouncementModal isOpen={isEditModalOpen} onClose={handleCloseModals} onSave={handleSaveAnnouncement} announcement={selectedAnnouncement} />
      <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleConfirmDelete} />
    </div>
  );
}

// --- MODAL COMPONENTS ---
interface AnnouncementFilterModalProps { isOpen: boolean; onClose: () => void; onApply: (filters: AnnouncementFilters) => void; onReset: () => void; initialFilters: AnnouncementFilters; }
function AnnouncementFilterModal({ isOpen, onClose, onApply, onReset, initialFilters }: AnnouncementFilterModalProps) {
  const [dateRange, setDateRange] = useState(initialFilters.dateRange);
  const [hasAttachment, setHasAttachment] = useState(initialFilters.hasAttachment);
  
  useEffect(() => { setDateRange(initialFilters.dateRange); setHasAttachment(initialFilters.hasAttachment); }, [isOpen, initialFilters]);

  const handleApply = () => { onApply({ dateRange, hasAttachment }); };
  const handleLocalReset = () => { setDateRange({ from: '', to: '' }); setHasAttachment('all'); onReset(); };
  const handleDateShortcut = (days: number) => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - days); setDateRange({ from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Filter Announcements</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Publication Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-100">
              <button onClick={() => handleDateShortcut(7)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 7 days
              </button>
              <span className="text-gray-300 self-center">•</span>
              <button onClick={() => handleDateShortcut(30)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 30 days
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">File Attachment Filter</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="attachment" 
                  value="all" 
                  checked={hasAttachment === 'all'} 
                  onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Show All Announcements</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="attachment" 
                  value="yes" 
                  checked={hasAttachment === 'yes'} 
                  onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">With File Attachments</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="attachment" 
                  value="no" 
                  checked={hasAttachment === 'no'} 
                  onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Without File Attachments</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            Reset Filters
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleApply} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewAnnouncementModal({ isOpen, onClose, announcement }: { isOpen: boolean; onClose: () => void; announcement: Announcement | null; }) { 
  if (!isOpen || !announcement) return null; 
  const fileUrl = announcement.file_path;
  
  return (
    <div className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Announcement Details</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-gray-500 mb-2">
            {announcement.publish_date ? new Date(announcement.publish_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'No publish date set'}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">{announcement.content}</p>
          {fileUrl && (
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Attachment Preview:</h4>
              {isImage(fileUrl) ? (
                <Image src={fileUrl} alt="Attachment" width={800} height={600} className="max-w-full h-auto rounded-md border" />
              ) : isPdf(fileUrl) ? (
                <embed src={fileUrl} type="application/pdf" className="w-full h-[50vh] border rounded-md" />
              ) : (
                <div className="p-4 bg-gray-100 rounded-md">
                  <p className="text-gray-700">Preview not available.</p>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                    Download Attachment
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t rounded-b-xl">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
function AnnouncementModal({ isOpen, onClose, onSave, announcement }: { isOpen: boolean; onClose: () => void; onSave: (data: AnnouncementFormData) => void; announcement: Announcement | null; }) { 
  const [formData, setFormData] = useState<AnnouncementFormData>({ 
    title: '', 
    content: '', 
    publish_date: new Date().toISOString().split('T')[0], 
    file_path: null 
  }); 
  
  useEffect(() => { 
    if (announcement) { 
      setFormData({ 
        title: announcement.title, 
        content: announcement.content || '', 
        publish_date: announcement.publish_date || null, 
        file_path: null 
      }); 
    } else { 
      setFormData({ 
        title: '', 
        content: '', 
        publish_date: new Date().toISOString().split('T')[0], 
        file_path: null 
      }); 
    } 
  }, [announcement, isOpen]); 
  
  if (!isOpen) return null; 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { 
    const { name, value, type } = e.target; 
    console.log('Form field change:', { name, value, type });

    if (type === 'file') { 
      const files = (e.target as HTMLInputElement).files; 
      setFormData(prev => ({ ...prev, file_path: files?.[0] || null })); 
      console.log('File selected:', files?.[0]?.name || 'No file');
    } else { 
      setFormData(prev => ({ ...prev, [name]: value })); 
    } 
  }; 
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    console.log('Submitting form data:', formData);
    onSave(formData); 
  }; return (
    <div className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{announcement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Announcement Title</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              placeholder="Enter a clear, descriptive title for your announcement" 
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">Announcement Content</label>
            <textarea 
              name="content" 
              id="content" 
              rows={8} 
              value={formData.content || ''} 
              onChange={handleChange} 
              placeholder="Write the full content of your announcement here. Be clear and informative." 
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label htmlFor="publish_date" className="block text-sm font-semibold text-gray-700 mb-2">Publication Date</label>
            <input 
              type="date" 
              name="publish_date" 
              id="publish_date" 
              value={formData.publish_date || ''} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">Select when this announcement should be published</p>
          </div>
          <div>
            <label htmlFor="file_path" className="block text-sm font-semibold text-gray-700 mb-2">File Attachment (Optional)</label>
            <input 
              type="file" 
              name="file_path" 
              id="file_path" 
              onChange={handleChange} 
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="mt-2 text-xs text-gray-500">
              {formData.file_path ? (
                <span className="text-green-600 font-medium">📎 {formData.file_path.name}</span>
              ) : (
                'No file selected. You can attach documents, images, or other relevant files.'
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  ); 
}
function ConfirmationModal({ isOpen, onClose, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) { 
  if (!isOpen) return null; 
  
  const message = 'Are you sure you want to permanently delete this announcement? This action cannot be undone.';
    
  return (
    <div className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">Confirm Deletion</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-xl">
          <button 
            onClick={onClose} 
            className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="cursor-pointerpx-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ); 
}