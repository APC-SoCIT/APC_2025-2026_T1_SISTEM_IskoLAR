'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabaseClient';

const ScholarSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [userName, setUserName] = useState({ firstName: '', lastName: '' });
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [, setIsSchoolYearOpen] = useState(false);
  const [isFirstSemOpen, setIsFirstSemOpen] = useState(false);
  const [isSecondSemOpen, setIsSecondSemOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      // The auth state change will trigger a redirect in useAuth
      // the protection on the routes and redirect appropriately
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const mainNavItems = [
    {
      label: 'Profile',
      href: '/scholar/profile',
      icon: (
        <svg width="20" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          />
        </svg>
      ),
    },
    {
      label: 'Announcements',
      href: '/scholar/announcements',
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
  ];

  const extraItems = [
    {
      label: 'User Manual',
      href: '/scholar/user-manual',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  const semesterSubItems = [
    { label: 'Application', href: '/academicyearID/semesterID/application' },
    { label: 'Status', href: '/academicyearID/semesterID/status' },
  ];

  // Keep dropdowns open if on a subpage
  // Add this before the return statement
  // This ensures the dropdowns stay open when on Application/Status pages
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('email_address', user.email)
            .single();
          
          if (userData) {
            setUserName({
              firstName: userData.first_name,
              lastName: userData.last_name
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Handle navigation states
  React.useEffect(() => {
    // Always open program and school year if on any semester page
    if (
      pathname.startsWith('/academicyearID/semesterID/') ||
      pathname.includes('/scholar/scholarship/1st-semester') ||
      pathname.includes('/scholar/scholarship/2nd-semester')
    ) {
      setIsProgramOpen(true);
      setIsSchoolYearOpen(true);

      // Open the correct semester dropdown if on its subpage
      if (
        pathname.includes('/scholar/scholarship/1st-semester') ||
        pathname === '/academicyearID/semesterID/application' ||
        pathname === '/academicyearID/semesterID/status'
      ) {
        setIsFirstSemOpen(true);
      } else {
        setIsFirstSemOpen(false);
      }

      if (pathname.includes('/scholar/scholarship/2nd-semester')) {
        setIsSecondSemOpen(true);
      } else {
        setIsSecondSemOpen(false);
      }
    } else {
      // Optionally close all if not in any semester page
      setIsFirstSemOpen(false);
      setIsSecondSemOpen(false);
    }
  }, [pathname]);

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
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {/* Main Section */}
        <div className="py-2 px-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Main</span>
        </div>

        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50/80'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                }`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Scholarship Dropdown */}
        <div
          className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
            isProgramOpen
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50/80'
          }`}
          onClick={() => {
            if (isProgramOpen) {
              setIsProgramOpen(false);
              setIsSchoolYearOpen(false);
              setIsFirstSemOpen(false);
              setIsSecondSemOpen(false);
            } else {
              setIsProgramOpen(true);
            }
          }}
        >
          <span className={`transition-colors duration-200 ${isProgramOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isProgramOpen ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
          }`}>Scholarship</span>
          {isProgramOpen && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
          <svg 
            className={`ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 ${isProgramOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isProgramOpen && (
          <div className="ml-4 space-y-1">
            {/* School Year */}
            <div className="pl-4 py-2">
              <span className="text-sm font-medium text-gray-700">A.Y. 2025 – 2026</span>
            </div>

            {/* Semesters */}
            <div className="space-y-1">
              {/* 1st Semester */}
              <div className="pl-8">
                <div
                  onClick={() => setIsFirstSemOpen(!isFirstSemOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 cursor-pointer py-2"
                >
                  <span>1st Semester</span>
                  <svg 
                    className={`ml-2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isFirstSemOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isFirstSemOpen && (
                  <div className="ml-4 space-y-1">
                    {semesterSubItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link href={item.href} key={item.href}>
                          <div className={`py-2 px-2 text-sm rounded-lg ${
                            isActive
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}>
                            {item.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2nd Semester */}
              <div className="pl-8">
                <div
                  onClick={() => setIsSecondSemOpen(!isSecondSemOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 cursor-pointer py-2"
                >
                  <span>2nd Semester</span>
                  <svg 
                    className={`ml-2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isSecondSemOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isSecondSemOpen && (
                  <div className="ml-4 space-y-1">
                    {semesterSubItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link href={item.href} key={item.href}>
                          <div className={`py-2 px-2 text-sm rounded-lg ${
                            isActive
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}>
                            {item.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Extras Section */}
        <div className="py-2 px-3 mt-6">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Extras</span>
        </div>

        {extraItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50/80'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                }`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Scholar Profile and Logout */}
      <div className="mt-auto border-t border-gray-200">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">{userName.firstName} {userName.lastName}</div>
              <div className="text-sm text-gray-500">Scholar</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-100 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ScholarSidebar;
