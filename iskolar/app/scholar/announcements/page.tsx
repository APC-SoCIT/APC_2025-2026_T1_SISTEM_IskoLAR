'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';

type Announcement = {
  announcements_id?: string;
  title?: string;
  content?: string | null;
  publish_date?: string | null;
  file_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

const isImageUrl = (url?: string | null) => {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url.split('?')[0]);
};
const isPdf = (url?: string | null) => {
  if (!url) return false;
  return /\.pdf$/i.test(url.split('?')[0]);
};

const formatDate = (d?: string | null) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d as string;
  }
};

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('email_address', user.email)
            .single();

          if (error) console.error('Error loading user data', error);
          if (userData) {
            setUserName(`${userData.first_name} ${userData.last_name}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      setError(null);
      console.log('[Announcements] loadAnnouncements: starting');
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('publish_date', { ascending: false });

        if (error) throw error;
        console.log('[Announcements] loadAnnouncements: fetched', Array.isArray(data) ? data.length : 0);
        if (isSubscribed) setAnnouncements(data ?? []);
      } catch (err) {
        console.error('Failed to load announcements', err);
        try {
          setError(err instanceof Error ? err.message : JSON.stringify(err));
        } catch {
          setError('Unknown error while loading announcements');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();

    // Subscribe to realtime changes on announcements table
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('[Announcements realtime] INSERT', payload);
          const newRow = (payload as any).new as Announcement;
          // Prevent duplicate inserts if the row already exists in state
          setAnnouncements((prev) => [newRow, ...prev.filter((a) => String(a.announcements_id) !== String(newRow.announcements_id))]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('[Announcements realtime] UPDATE', payload);
          const updated = (payload as any).new as Announcement;
          setAnnouncements((prev) => prev.map((a) => (String(a.announcements_id) === String(updated.announcements_id) ? updated : a)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('[Announcements realtime] DELETE', payload);
          const oldRow = (payload as any).old as Announcement;
          setAnnouncements((prev) => prev.filter((a) => String(a.announcements_id) !== String(oldRow.announcements_id)));
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      try {
        channel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64">
      {/* Main content area — cards are the main layer */}
      <div className="pt-4 min-h-[calc(100vh-1rem)] flex justify-center items-start">
        <main className="w-full max-w-5xl mt-4 px-6 py-6">
          {/* Page header similar to admin side */}
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500">Latest updates and information from administration.</p>
          </header>

          {loading ? (
            <div className="text-sm text-gray-500">Loading announcements...</div>
          ) : error ? (
            <div className="text-sm text-red-600">Failed to load announcements: {error}. Check console/network or run the dev server.</div>
          ) : announcements.length === 0 ? (
            <div className="text-sm text-gray-500">No announcements at the moment.</div>
          ) : (
            // Only show announcements whose publish_date is not in the future
            (() => {
              const now = new Date();
              const visibleAnnouncements = announcements
                .filter((ann) => {
                  if (!ann.publish_date) return true; // no publish_date -> immediately visible
                  const pub = new Date(ann.publish_date);
                  return pub <= now;
                })
                .sort((a, b) => {
                  const da = a.publish_date ? new Date(a.publish_date).getTime() : 0;
                  const db = b.publish_date ? new Date(b.publish_date).getTime() : 0;
                  return db - da;
                });

              if (visibleAnnouncements.length === 0) {
                return <div className="text-sm text-gray-500">No announcements available yet.</div>;
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleAnnouncements.map((a) => (
                    <article
                      key={a.announcements_id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                      onClick={() => { setSelectedAnnouncement(a); setIsViewModalOpen(true); }}
                      aria-labelledby={`ann-${a.announcements_id}`}
                    >
                      <div className="relative h-56 sm:h-64 md:h-48 lg:h-60">
                        {a.file_path && isImageUrl(a.file_path) ? (
                          <img src={a.file_path} alt={a.title ?? 'Announcement image'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="text-gray-400 text-lg">No image</div>
                          </div>
                        )}

                        {/* intensified gradient fade */}
                        <div className="absolute left-0 right-0 bottom-0 h-2/3 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

                        {/* Title + publish date over image (larger title) */}

                        <div className="absolute left-4 right-4 bottom-4 text-white">
                          <h3 id={`ann-${a.announcements_id}`} className="text-lg md:text-xl font-semibold leading-tight drop-shadow">{a.title}</h3>
                          {a.publish_date && (
                            <p className="text-sm text-white/80 mt-1">{formatDate(a.publish_date)}</p>
                          )}
                        </div>
*** End Patch
                      </div>
                    </article>
                  ))}
                </div>
              );
            })()
          )}
        </main>
      </div>
      {/* View modal - matches admin's modal structure */}
      <ViewAnnouncementModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedAnnouncement(null); }} announcement={selectedAnnouncement} />
    </div>
  );
}

function ViewAnnouncementModal({ isOpen, onClose, announcement }: { isOpen: boolean; onClose: () => void; announcement: Announcement | null; }) {
  if (!isOpen || !announcement) return null;
  const fileUrl = announcement.file_path;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header image with reduced opacity, sized approx 820x312 */}
        {fileUrl && isImageUrl(fileUrl) && (
          <div className="w-full flex-shrink-0 relative" style={{ maxHeight: 320, overflow: 'hidden' }}>
            <img src={fileUrl} alt={announcement.title ?? 'Announcement image'} style={{ width: '100%', height: 312, objectFit: 'cover' }} className="block" />
            {/* 50% black overlay to fade image */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            {/* centered title over header image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow text-center px-4">{announcement.title}</h3>
            </div>
            {/* close button on top-right of header */}
            <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1 bg-white/80 hover:bg-white rounded-full">
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        )}
        <div className="p-6 flex-grow overflow-y-auto">
          {/* If non-image file, show embed or download link above content */}
          {fileUrl && !isImageUrl(fileUrl) && (
            <div className="mb-6">
              {isPdf(fileUrl) ? (
                <embed src={fileUrl} type="application/pdf" className="w-full h-[50vh] rounded-lg border border-gray-200 shadow-sm" />
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Attachment
                  </a>
                </div>
              )}
            </div>
          )}
          {/* Title & date (show inside body as well) */}
          {!fileUrl && <h3 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h3>}
          {announcement.publish_date && (
            <p className="text-sm text-gray-500 mb-2">{formatDate(announcement.publish_date)}</p>
          )}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
}