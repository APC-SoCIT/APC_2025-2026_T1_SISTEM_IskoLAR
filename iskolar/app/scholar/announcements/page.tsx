'use client';

import { useState, useEffect } from 'react';
import BrandedLoader from "@/app/components/ui/BrandedLoader";
import { XMarkIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

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
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d as string;
  }
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('publish_date', { ascending: false });

        if (error) throw error;
        if (isSubscribed) setAnnouncements(data ?? []);
      } catch (err) {
        console.error('Failed to load announcements', err);
        setError(
          err instanceof Error ? err.message : JSON.stringify(err)
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();

    type RealtimePayload = {
      new: Announcement;
      old: Announcement;
    };

    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          const newRow = (payload as RealtimePayload).new;
          setAnnouncements((prev) => [
            newRow,
            ...prev.filter(
              (a) =>
                String(a.announcements_id) !==
                String(newRow.announcements_id)
            ),
          ]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'announcements' },
        (payload) => {
          const updated = (payload as RealtimePayload).new;
          setAnnouncements((prev) =>
            prev.map((a) =>
              String(a.announcements_id) ===
              String(updated.announcements_id)
                ? updated
                : a
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'announcements' },
        (payload) => {
          const oldRow = (payload as RealtimePayload).old;
          setAnnouncements((prev) =>
            prev.filter(
              (a) =>
                String(a.announcements_id) !==
                String(oldRow.announcements_id)
            )
          );
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      channel.unsubscribe();
    };
  }, []);

  // Full-page loading screen for initial load
  if (loading && announcements.length === 0) {
    return <BrandedLoader title="Loading Announcements" subtitle="Fetching latest updates..." />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64">
      <div className="pt-4 min-h-[calc(100vh-1rem)] flex justify-center items-start">
        <main className="w-full max-w-5xl mt-4 px-6 py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Announcements
            </h1>
            <p className="text-sm text-gray-500">
              Latest updates and information from administration.
            </p>
          </header>

          {error ? (
            <div className="text-sm text-red-600">
              Failed to load announcements: {error}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-sm text-gray-500">
              No announcements at the moment.
            </div>
          ) : (
            (() => {
              const now = new Date();
              const visibleAnnouncements = announcements
                .filter((ann) => {
                  if (!ann.publish_date) return true;
                  return new Date(ann.publish_date) <= now;
                })
                .sort((a, b) => {
                  const da = a.publish_date
                    ? new Date(a.publish_date).getTime()
                    : 0;
                  const db = b.publish_date
                    ? new Date(b.publish_date).getTime()
                    : 0;
                  return db - da;
                });

              if (visibleAnnouncements.length === 0)
                return (
                  <div className="text-sm text-gray-500">
                    No announcements available yet.
                  </div>
                );

              const recentAnnouncements = visibleAnnouncements.slice(0, 3);

              return (
                <div className="space-y-8">
                  {/* Recent News */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Recent News
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentAnnouncements.map((a) => (
                        <article
                          key={a.announcements_id}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                          onClick={() => {
                            setSelectedAnnouncement(a);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <div className="relative h-48 sm:h-52 md:h-44 lg:h-48">
                            {a.file_path && isImageUrl(a.file_path) ? (
                              <Image
                                src={a.file_path}
                                alt={a.title ?? 'Announcement image'}
                                width={400}
                                height={300}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <div className="text-gray-400 text-lg">
                                  No image
                                </div>
                              </div>
                            )}

                            <div className="absolute left-0 right-0 bottom-0 h-2/3 bg-gradient-to-t from-black to-transparent"></div>
                            <div className="absolute left-4 right-4 bottom-4 text-white">
                              <h3 className="text-lg md:text-xl font-semibold leading-tight drop-shadow">
                                {a.title}
                              </h3>
                              {a.publish_date && (
                                <p className="text-sm text-white/80 mt-1">
                                  {formatDate(a.publish_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* All Announcements */}
                  <section>
                    <h2 className="text-lg font-medium text-gray-700 mb-4">
                      All Announcements
                    </h2>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-20"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visibleAnnouncements.map((a) => (
                            <tr
                              key={`list-${a.announcements_id}`}
                              onClick={() => {
                                setSelectedAnnouncement(a);
                                setIsViewModalOpen(true);
                              }}
                              className="hover:bg-gray-50 cursor-pointer"
                            >
                              <td className="w-20 p-0">
                                <div className="relative w-full h-16 bg-gray-100 flex items-center justify-center">
                                  {a.file_path && isImageUrl(a.file_path) ? (
                                    <Image
                                      src={a.file_path}
                                      alt=""
                                      width={80}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11H5m14 0a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2m14 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-900">
                                  {a.title}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {formatDate(a.publish_date)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              );
            })()
          )}
        </main>
      </div>

      <ViewAnnouncementModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}

function ViewAnnouncementModal({
  isOpen,
  onClose,
  announcement,
}: {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}) {
  if (!isOpen || !announcement) return null;
  const fileUrl = announcement.file_path;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-gray-900/50 overflow-y-auto flex justify-center items-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {fileUrl && isImageUrl(fileUrl) && (
          <div
            className="w-full flex-shrink-0 relative"
            style={{ maxHeight: 320, overflow: 'hidden' }}
          >
            <Image
              src={fileUrl}
              alt={announcement.title ?? 'Announcement image'}
              width={820}
              height={312}
              className="w-full h-[312px] object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-lg md:text-xl font-bold text-white drop-shadow text-center px-4">
                {announcement.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-20 p-1 bg-white/80 hover:bg-white rounded-full"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}

        <div className="p-6 flex-grow overflow-y-auto">
          {fileUrl && !isImageUrl(fileUrl) && (
            <div className="mb-6">
              {isPdf(fileUrl) ? (
                <embed
                  src={fileUrl}
                  type="application/pdf"
                  className="w-full h-[50vh] rounded-lg border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Attachment
                  </a>
                </div>
              )}
            </div>
          )}

          {!fileUrl && (
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {announcement.title}
            </h3>
          )}
          {announcement.publish_date && (
            <p className="text-sm text-gray-500 mb-2">
              {formatDate(announcement.publish_date)}
            </p>
          )}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </p>
        </div>
      </div>
    </div>
  );
}