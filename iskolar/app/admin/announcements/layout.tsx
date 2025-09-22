import React from 'react';

// This layout now only adds padding, since the main structure is handled by the parent AdminLayout.
export default function AnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-8">
      {children}
    </div>
  );
}