'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const AdminSidebar = () => {
  const pathname = usePathname();

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3zM14 12a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7z"
          />
        </svg>
      ),
    },
    {
      label: 'Application & Verification',
      href: '/admin/applications',
      icon: (
        <svg width="20" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      label: 'Disbursements',
      href: '/admin/disbursements',
      icon: (
        <svg width="18" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 6v12M6 12h12m-6 6a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
          />
        </svg>
      ),
    },
    {
      label: 'Schedule',
      href: '/admin/schedule',
      icon: (
        <svg width="14" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
          />
        </svg>
      ),
    },
  ];

  const adminNavItems = [
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="m19.622 10.395-1.097-2.65L20 6l-2-2-1.745 1.475-2.65-1.097-.406-2.378h-3l-.406 2.378-2.65 1.097L5.398 4 3.4 6l1.475 1.745-1.097 2.65L2 10.8v3l2.378.406 1.097 2.65L4 18.6l2 2 1.745-1.475 2.65 1.097.406 2.378h3l.406-2.378 2.65-1.097L18.602 20l2-2-1.475-1.745 1.097-2.65L22 13.2v-3l-2.378-.805Z"
          />
        </svg>
      ),
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: (
        <svg width="20" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-64 font-geist flex flex-col border-r bg-white border-gray-300 text-sm shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">
      {/* Logo Header */}
      <div className="p-4 pl-7 border-b flex items-center gap-2 border-gray-300">
        <Image
          src="/IskoLAR.png"
          alt="IskoLAR logo"
          width={28}
          height={28}
          className="transition-all duration-300"
        />
        <span className="text-base font-semibold">IskoLAR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-2">
        {/* Main Section */}
        <div className="flex items-center gap-3 py-2 px-4">
          <span className="text-xs font-semibold text-gray-500">Main</span>
        </div>

        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 px-4 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-[#2196F3]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}
                <span className={`${isActive ? 'text-[#2196F3]' : 'text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Administration Section */}
        <div className="flex items-center gap-3 py-2 px-4 mt-8">
          <span className="text-xs font-semibold text-gray-500">Administration</span>
        </div>

        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 px-4 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-[#2196F3]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}
                <span className={`${isActive ? 'text-[#2196F3]' : 'text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
