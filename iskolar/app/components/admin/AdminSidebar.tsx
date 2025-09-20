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
      label: 'Releases',
      href: '/admin/releases',
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
      label: 'Announcements',
      href: '/admin/announcements',
      icon: (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M15 7.2322H13.9002M2.53555 7.2322H3.63535M8.76777 0.999969V2.09977M4.36086 2.82565L5.13805 3.60357M13.1743 2.82565L12.3964 3.60357M9.24839 4.82252C6.01533 7.64462 2.53445 11.1941 1.2979 12.4735C1.00828 12.773 0.915901 13.2096 1.08271 13.5909C1.17362 13.798 1.28104 14.0242 1.39212 14.2167C1.5032 14.4092 1.64544 14.6152 1.77961 14.7974C2.02597 15.1328 2.4505 15.2707 2.85449 15.1699C4.58082 14.7384 9.39539 13.4989 13.4559 12.1102" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M7.34242 6.56976C7.34242 6.56976 8.10898 7.33669 9.40859 9.58763C10.7082 11.8386 10.989 12.8859 10.989 12.8859M7.73981 13.9619L7.95758 14.775C8.01477 14.9886 8.02935 15.2112 8.00048 15.4304C7.97161 15.6495 7.89986 15.8609 7.78933 16.0523C7.67879 16.2437 7.53164 16.4115 7.35627 16.546C7.18089 16.6806 6.98073 16.7792 6.76722 16.8364C6.55371 16.8936 6.33102 16.9082 6.11187 16.8793C5.89272 16.8505 5.68141 16.7787 5.48999 16.6682C5.29857 16.5577 5.1308 16.4105 4.99625 16.2351C4.8617 16.0598 4.76301 15.8596 4.70582 15.6461L4.52472 14.9686M8.96793 4.33606C8.96793 4.33606 9.84668 5.29692 11.595 8.32542C13.3433 11.3539 13.7363 12.5952 13.7363 12.5952" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
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
