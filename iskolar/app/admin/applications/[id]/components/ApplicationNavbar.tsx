'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export default function ApplicationNavbar() {
  const { id } = useParams();
  const pathname = usePathname();

  const tabs = [
    { 
      href: `/admin/applications/${id}`, 
      label: 'Overview',
      active: pathname === `/admin/applications/${id}`
    },
    { 
      href: `/admin/applications/${id}/eligibility`, 
      label: 'Eligibility',
      active: pathname.includes('/eligibility')
    },
    { 
      href: `/admin/applications/${id}/documents`, 
      label: 'Documents',
      active: pathname.includes('/documents')
    },
    { 
      href: `/admin/applications/${id}/education`, 
      label: 'Education',
      active: pathname.includes('/education')
    },
    { 
      href: `/admin/applications/${id}/notes`, 
      label: 'Notes',
      active: pathname.includes('/notes')
    },
  ];

  return (
    <div className="flex gap-6 border-b border-gray-200 -mb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative
                    ${tab.active 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
