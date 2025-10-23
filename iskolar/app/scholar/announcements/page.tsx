'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
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

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

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
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('publish_date', { ascending: false });

        if (error) throw error;
        if (isSubscribed) setAnnouncements(data ?? []);
      } catch (err) {
        console.error('Failed to load announcements', err);
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
          const newRow = (payload as any).new as Announcement;
          // Prevent duplicate inserts if the row already exists in state
          setAnnouncements((prev) => [newRow, ...prev.filter((a) => String(a.announcements_id) !== String(newRow.announcements_id))]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'announcements' },
        (payload) => {
          const updated = (payload as any).new as Announcement;
          setAnnouncements((prev) => prev.map((a) => (String(a.announcements_id) === String(updated.announcements_id) ? updated : a)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'announcements' },
        (payload) => {
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

  const formatDate = (d?: string | null) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d as string;
    }
  };

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
          ) : announcements.length === 0 ? (
            <div className="text-sm text-gray-500">No announcements at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {announcements.map((a) => (
                <article
                  key={a.announcements_id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200"
                  aria-labelledby={`ann-${a.announcements_id}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 id={`ann-${a.announcements_id}`} className="font-semibold text-gray-900 text-xl">
                      {a.title}
                    </h3>
                    <time className="text-sm text-gray-400">{formatDate(a.publish_date)}</time>
                  </div>

                  {a.content && (
                    <div className="text-gray-700 text-base mb-4 whitespace-pre-wrap leading-relaxed">{a.content}</div>
                  )}

                  {a.file_path && (
                    <div className="mt-2">
                      <a href={a.file_path} target="_blank" rel="noreferrer" className="inline-block text-sm text-blue-600 underline">
                        View attachment
                      </a>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400">Posted: {a.created_at ? formatDate(a.created_at) : ''}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}