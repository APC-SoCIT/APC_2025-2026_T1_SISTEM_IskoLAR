import React from 'react';

// This layout is now a simple wrapper. 
// All padding and margins are handled in page.tsx for cohesion.
export default function UserManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}