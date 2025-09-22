"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MegaphoneIcon, XMarkIcon, AdjustmentsHorizontalIcon, TrashIcon as BulkTrashIcon } from '@heroicons/react/24/solid';
import { DocumentMagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---
type Announcement = { 
  announcement_id: string;
  title: string; 
  content: string; 
  publish_date: string;
  attachment: string | null;
  created_at: string;
};
type AnnouncementFormData = { title: string; content: string; publish_date: string; attachmentFile?: File | null; };
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
  
  const [selectedAnnouncementIds, setSelectedAnnouncementIds] = useState<string[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'delete-bulk' | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAnnouncements = async () => { setIsLoading(true); try { const response = await fetch('/api/announcements'); if (!response.ok) throw new Error('API Error'); const data = await response.json(); setAnnouncements(data); } catch (error) { console.error(error); setNotification({ message: 'Failed to fetch announcements.', type: 'error' }); } finally { setIsLoading(false); } };
  useEffect(() => { fetchAnnouncements(); }, []);
  useEffect(() => { if (notification) { const timer = setTimeout(() => { setNotification(null); }, 3000); return () => clearTimeout(timer); } }, [notification]);

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((ann) => {
          const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesAttachment = filters.hasAttachment === 'all' || (filters.hasAttachment === 'yes' && ann.attachment) || (filters.hasAttachment === 'no' && !ann.attachment);
          let matchesDate = true;
          if (filters.dateRange.from && filters.dateRange.to) {
              const annDate = new Date(ann.publish_date);
              matchesDate = annDate >= new Date(filters.dateRange.from) && annDate <= new Date(filters.dateRange.to);
          }
          return matchesSearch && matchesAttachment && matchesDate;
      })
      .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  }, [announcements, searchQuery, filters]);

  const handleApplyFilters = (newFilters: AnnouncementFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); };
  const handleResetFilters = () => { setFilters({ dateRange: { from: '', to: '' }, hasAttachment: 'all' }); setIsFilterModalOpen(false); };
  const activeFilterCount = (filters.dateRange.from && filters.dateRange.to ? 1 : 0) + (filters.hasAttachment !== 'all' ? 1 : 0);

  const handleSelect = (id: string) => { setSelectedAnnouncementIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
  // Removed unused handleSelectAll function

  // Removed unused handleOpenCreateModal function
  const handleOpenViewModal = (ann: Announcement) => { setSelectedAnnouncement(ann); setIsViewModalOpen(true); };
  const handleOpenEditModal = (ann: Announcement) => { setSelectedAnnouncement(ann); setIsEditModalOpen(true); };
  const handleOpenConfirm = (ann: Announcement) => { setSelectedAnnouncement(ann); setConfirmAction('delete'); setIsConfirmOpen(true); };
  const handleOpenBulkConfirm = () => { setConfirmAction('delete-bulk'); setIsConfirmOpen(true); };
  const handleCloseModals = () => { setIsViewModalOpen(false); setIsEditModalOpen(false); setIsConfirmOpen(false); setSelectedAnnouncement(null); setConfirmAction(null); };

  const handleSaveAnnouncement = async (formData: AnnouncementFormData) => {
    const method = selectedAnnouncement ? 'PATCH' : 'POST';
    const endpoint = selectedAnnouncement ? `/api/announcements/${selectedAnnouncement.announcement_id}` : '/api/announcements';
    const body = new FormData();
    body.append('title', formData.title);
    body.append('content', formData.content);
    body.append('publish_date', formData.publish_date);
    if (formData.attachmentFile) { body.append('attachmentFile', formData.attachmentFile); }
    try { const response = await fetch(endpoint, { method, body }); if (!response.ok) throw new Error('Failed to save'); setNotification({ message: `Announcement ${selectedAnnouncement ? 'updated' : 'created'}!`, type: 'success' }); fetchAnnouncements(); } catch (error) { console.error(error); setNotification({ message: 'Failed to save announcement.', type: 'error' }); }
    handleCloseModals();
  };
  
  const handleConfirmDelete = async () => {
    const isBulk = confirmAction === 'delete-bulk';
    const idsToDelete = isBulk ? selectedAnnouncementIds : [selectedAnnouncement?.announcement_id];
    for (const id of idsToDelete) {
        if (!id) continue;
        try {
            const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Failed to delete ${id}`);
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Failed to delete one or more announcements.', type: 'error' });
        }
    }
    setNotification({ message: `${idsToDelete.length} announcement(s) deleted.`, type: 'success' });
    fetchAnnouncements();
    setSelectedAnnouncementIds([]);
    handleCloseModals();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-1"><h1 className="text-2xl font-semibold text-gray-900">Announcement Management</h1><p className="text-sm text-gray-500">Create, edit, and publish updates for users.</p></div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input type="text" placeholder="Search announcements..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
          </div>
          <button onClick={() => setIsFilterModalOpen(true)} className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" /> Filter
            {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{activeFilterCount}</span>}
          </button>
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="absolute top-1.5 right-1.5 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span></button>
          <div className="relative group">
            <button className="flex items-center gap-3 group"><div className="flex flex-col items-end"><span className="text-sm font-medium text-gray-900">Admin User</span><span className="text-xs text-gray-500">administrator</span></div><div className="flex items-center gap-2"><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">AU</div><svg className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div></button>
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 invisible opacity-0 translate-y-1 transition-all duration-200 ease-in-out z-50 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0"><div className="py-1"><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>View Profile</Link><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</Link><hr className="my-1 border-gray-200" /><button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Sign out</button></div></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Announcements ({filteredAnnouncements.length})</h2></div>
        {selectedAnnouncementIds.length > 0 && (<div className="px-6 py-3 bg-blue-50 border-b border-blue-200"><div className="flex items-center justify-between"><span className="text-sm font-medium text-blue-800">{selectedAnnouncementIds.length} announcement(s) selected</span><div className="space-x-2"><button onClick={handleOpenBulkConfirm} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"><BulkTrashIcon className="h-4 w-4"/>Delete Selected</button></div></div></div>)}
        
        {isLoading ? (<p className="p-6 text-center text-gray-500">Loading...</p>) : filteredAnnouncements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((ann) => (
              <div key={ann.announcement_id} className={`p-4 flex items-center transition-colors duration-150 ${selectedAnnouncementIds.includes(ann.announcement_id) ? 'bg-blue-50' : ''}`}>
                <div className="p-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedAnnouncementIds.includes(ann.announcement_id)} onChange={() => handleSelect(ann.announcement_id)} /></div>
                <div className="flex-1 pl-2"><p className="text-sm text-gray-500">{new Date(ann.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p><h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3><p className="text-gray-600 mt-1 text-sm line-clamp-1">{ann.content}</p></div>
                <div className="flex-shrink-0 flex space-x-2 ml-4"><button onClick={() => handleOpenViewModal(ann)} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700" title="Preview"><DocumentMagnifyingGlassIcon className="h-5 w-5" /></button><button onClick={() => handleOpenEditModal(ann)} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600" title="Edit"><PencilSquareIcon className="h-5 w-5" /></button><button onClick={() => handleOpenConfirm(ann)} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700" title="Delete"><TrashIcon className="h-5 w-5" /></button></div>
              </div>
            ))}
          </div>
        ) : (<div className="text-center p-10"><MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">No Announcements Found</h3><p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p></div>)}
      </div>

      <AnnouncementFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} onReset={handleResetFilters} initialFilters={filters} />
      <ViewAnnouncementModal isOpen={isViewModalOpen} onClose={handleCloseModals} announcement={selectedAnnouncement} />
      <AnnouncementModal isOpen={isEditModalOpen} onClose={handleCloseModals} onSave={handleSaveAnnouncement} announcement={selectedAnnouncement} />
      <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleConfirmDelete} action={confirmAction} selectedCount={selectedAnnouncementIds.length} />
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
    <div className="fixed inset-0 bg-black/25 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b pb-4"><h3 className="text-xl font-semibold text-gray-900">Filter Announcements</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">From</label><input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">To</label><input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
            </div>
            <div className="flex gap-2 mt-2"><button onClick={() => handleDateShortcut(7)} className="text-xs text-gray-600 hover:text-blue-600">Last 7 days</button><span className="text-gray-300">|</span><button onClick={() => handleDateShortcut(30)} className="text-xs text-gray-600 hover:text-blue-600">Last 30 days</button></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
            <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="radio" name="attachment" value="all" checked={hasAttachment === 'all'} onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> <span className="ml-2 text-sm">All</span></label>
                <label className="flex items-center"><input type="radio" name="attachment" value="yes" checked={hasAttachment === 'yes'} onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> <span className="ml-2 text-sm">Has Attachment</span></label>
                <label className="flex items-center"><input type="radio" name="attachment" value="no" checked={hasAttachment === 'no'} onChange={(e) => setHasAttachment(e.target.value as AnnouncementFilters["hasAttachment"])} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> <span className="ml-2 text-sm">No Attachment</span></label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Reset</button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

function ViewAnnouncementModal({ isOpen, onClose, announcement }: { isOpen: boolean; onClose: () => void; announcement: Announcement | null; }) { if (!isOpen || !announcement) return null; const attachmentUrl = announcement.attachment; return (<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]"><div className="flex justify-between items-center p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">Announcement Details</h2><button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><XMarkIcon className="h-6 w-6" /></button></div><div className="p-6 flex-grow overflow-y-auto"><p className="text-sm text-gray-500 mb-2">{new Date(announcement.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p><h3 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h3><p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">{announcement.content}</p>{attachmentUrl && (<div className="border-t pt-4"><h4 className="text-lg font-semibold mb-2 text-gray-800">Attachment Preview:</h4>{isImage(attachmentUrl) ? (<Image src={attachmentUrl} alt="Attachment" width={800} height={600} className="max-w-full h-auto rounded-md border" />) : isPdf(attachmentUrl) ? (<embed src={attachmentUrl} type="application/pdf" className="w-full h-[50vh] border rounded-md" />) : (<div className="p-4 bg-gray-100 rounded-md"><p className="text-gray-700">Preview not available.</p><a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Download Attachment</a></div>)}</div>)}</div><div className="p-6 bg-gray-50 border-t"><button onClick={onClose} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">Close</button></div></div></div>); }
function AnnouncementModal({ isOpen, onClose, onSave, announcement }: { isOpen: boolean; onClose: () => void; onSave: (data: AnnouncementFormData) => void; announcement: Announcement | null; }) { const [formData, setFormData] = useState<AnnouncementFormData>({ title: '', content: '', publish_date: '', attachmentFile: null }); useEffect(() => { if (announcement) { setFormData({ title: announcement.title, content: announcement.content, publish_date: announcement.publish_date, attachmentFile: null }); } else { setFormData({ title: '', content: '', publish_date: new Date().toISOString().split('T')[0], attachmentFile: null }); } }, [announcement, isOpen]); if (!isOpen) return null; const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; if (e.target.type === 'file') { const files = (e.target as HTMLInputElement).files; setFormData(prev => ({ ...prev, attachmentFile: files?.[0] || null })); } else { setFormData(prev => ({ ...prev, [name]: value })); } }; const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); }; return (<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4"><form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"><div className="flex justify-between items-center p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">{announcement ? 'Edit Announcement' : 'Create New Announcement'}</h2><button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><XMarkIcon className="h-6 w-6" /></button></div><div className="p-6 flex-grow overflow-y-auto space-y-4"><div><label htmlFor="title">Title</label><input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label htmlFor="content">Content</label><textarea name="content" id="content" rows={8} value={formData.content} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label htmlFor="publish_date">Publish Date</label><input type="date" name="publish_date" id="publish_date" value={formData.publish_date} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label htmlFor="attachmentFile">Attachment</label><input type="file" name="attachmentFile" id="attachmentFile" onChange={handleChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-gray-300 rounded-md shadow-sm p-0"/><div>{formData.attachmentFile ? `Selected: ${formData.attachmentFile.name}` : 'No file chosen'}</div></div></div><div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t"><button type="button" onClick={onClose}>Cancel</button><button type="submit">Save</button></div></form></div>); }
function ConfirmationModal({ isOpen, onClose, onConfirm, action, selectedCount }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; action: 'delete' | 'delete-bulk' | null; selectedCount: number; }) { if (!isOpen) return null; const isBulk = action === 'delete-bulk'; const message = isBulk ? `Are you sure you want to permanently delete these ${selectedCount} announcements? This cannot be undone.` : 'Are you sure you want to permanently delete this announcement? This cannot be undone.'; return (<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"><div className="p-6"><h2 className="text-lg font-bold text-gray-900">Confirm Deletion</h2><p className="mt-2 text-sm text-gray-600">{message}</p></div><div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t"><button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button><button onClick={onConfirm} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button></div></div></div>); }