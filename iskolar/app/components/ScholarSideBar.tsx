'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';

const ScholarSidebar = () => {
  const pathname = usePathname();
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);
  const [isFirstSemOpen, setIsFirstSemOpen] = useState(false);
  const [isSecondSemOpen, setIsSecondSemOpen] = useState(false);

  const navItems = [
    {
      label: 'Announcements',
      href: '/scholar/announcements',
      iconInactive: '/icons/announcements1.svg',
      iconActive: '/icons/announcements2.svg',
    },
    {
      label: 'Profile',
      href: '/scholar/profile',
      iconInactive: '/icons/profile1.svg',
      iconActive: '/icons/profile2.svg',
    },
  ];

  const extraItems = [
    {
      label: 'User Manual',
      href: '/scholar/user-manual',
      iconInactive: '/icons/user-manual1.svg',
      iconActive: '/icons/user-manual2.svg',
    },
  ];

  const semesterSubItems = [
    { label: 'Application', href: '/academicyearID/semesterID/application' },
    { label: 'Status', href: '/academicyearID/semesterID/status' },
  ];

  // Keep dropdowns open if on a subpage
  // Add this before the return statement
  // This ensures the dropdowns stay open when on Application/Status pages
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
      <nav className="flex-1 mt-4 space-y-1">
        {/* Main Section Title */}
        <div className="flex items-center gap-3 py-2 pl-7">
          <span className="text-xs font-semibold text-gray-500">Main</span>
        </div>

        {/* Normal Nav Items */}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 pl-7 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}

                <div className="w-5 flex justify-center">
                  <Image
                    src={isActive ? item.iconActive : item.iconInactive}
                    alt={`${item.label} icon`}
                    width={16}
                    height={16}
                  />
                </div>

                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Scholarship Dropdown */}
        <div
          className={`flex items-center gap-3 py-3 pl-7 transition-all cursor-pointer relative ${
            pathname.startsWith('/scholar/scholarship')
              ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
              : 'text-black hover:bg-gray-100'
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
          {pathname.startsWith('/scholar/scholarship') && (
            <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
          )}

          <div className="w-5 flex justify-center">
            <Image
              src={
                pathname.startsWith('/scholar/scholarship')
                  ? '/icons/program2.svg'
                  : '/icons/program1.svg'
              }
              alt="Scholarship icon"
              width={15}
              height={15}
            />
          </div>

          <span>Scholarship</span>

          <div className="ml-auto pr-4">
            {isProgramOpen ? (
              <Image
                src="/icons/chevron_down.svg"
                alt="Collapse Scholarship"
                width={10}
                height={10}
              />
            ) : (
              <Image
                src="/icons/chevron_left.svg"
                alt="Expand Scholarship"
                width={7}
                height={7}
              />
            )}
          </div>
        </div>

        {isProgramOpen && (
          <div>
            {/* School Year */}
            <div
              className={`flex items-center justify-between py-3 pl-12 transition-all cursor-pointer relative ${
                pathname.includes('/scholar/scholarship/1st-semester') ||
                pathname.includes('/scholar/scholarship/2nd-semester')
                  ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
                  : 'text-black hover:bg-gray-100'
              }`}
              onClick={() => setIsSchoolYearOpen(!isSchoolYearOpen)}
            >
              <span>A.Y. 2025 – 2026</span>

              <span className="pr-4">
                {isSchoolYearOpen ? (
                  <Image
                    src="/icons/chevron_down.svg"
                    alt="Collapse School Year"
                    width={10}
                    height={10}
                  />
                ) : (
                  <Image
                    src="/icons/chevron_left.svg"
                    alt="Expand School Year"
                    width={7}
                    height={7}
                  />
                )}
              </span>
            </div>

            {/* Semesters under School Year */}
            {isSchoolYearOpen && (
              <div>
                {/* 1st Semester */}
                <div
                  className="flex items-center justify-between py-3 pl-16 cursor-pointer hover:bg-gray-100"
                  onClick={() => setIsFirstSemOpen(!isFirstSemOpen)}
                >
                  <span>1st Semester</span>
                  <span className="pr-4">
                    {isFirstSemOpen ? (
                      <Image
                        src="/icons/chevron_down.svg"
                        alt="Collapse 1st Semester"
                        width={10}
                        height={10}
                      />
                    ) : (
                      <Image
                        src="/icons/chevron_left.svg"
                        alt="Expand 1st Semester"
                        width={7}
                        height={7}
                      />
                    )}
                  </span>
                </div>

                {isFirstSemOpen && (
                  <div>
                    {semesterSubItems.map((sub) => {
                      const isActive =
                        pathname === sub.href || pathname.startsWith(sub.href);

                      return (
                        <Link href={sub.href} key={`1st-${sub.label}`} legacyBehavior>
                          <a
                            className={`flex items-center py-3 pl-20 transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
                                : 'text-black hover:bg-gray-100'
                            }`}
                            // Removed onClick that would close the dropdown
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                            )}
                            <span>{sub.label}</span>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 2nd Semester */}
                <div
                  className="flex items-center justify-between py-3 pl-16 cursor-pointer hover:bg-gray-100"
                  onClick={() => setIsSecondSemOpen(!isSecondSemOpen)}
                >
                  <span>2nd Semester</span>
                  <span className="pr-4">
                    {isSecondSemOpen ? (
                      <Image
                        src="/icons/chevron_down.svg"
                        alt="Collapse 2nd Semester"
                        width={10}
                        height={11}
                      />
                    ) : (
                      <Image
                        src="/icons/chevron_left.svg"
                        alt="Expand 2nd Semester"
                        width={7}
                        height={7}
                      />
                    )}
                  </span>
                </div>

                {isSecondSemOpen && (
                  <div>
                    {semesterSubItems.map((sub) => {
                      const isActive =
                        pathname === sub.href || pathname.startsWith(sub.href);

                      return (
                        <Link href={sub.href} key={`2nd-${sub.label}`} legacyBehavior>
                          <a
                            className={`flex items-center py-3 pl-20 transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
                                : 'text-black hover:bg-gray-100'
                            }`}
                            // Removed onClick that would close the dropdown
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                            )}
                            <span>{sub.label}</span>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Extras Section */}
        <div className="mt-4 flex items-center gap-3 py-2 pl-7">
          <span className="text-xs font-semibold text-gray-500">Extras</span>
        </div>

        {extraItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 pl-7 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-[#2196F3] font-medium'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}

                <div className="w-5 flex justify-center">
                  <Image
                    src={isActive ? item.iconActive : item.iconInactive}
                    alt={`${item.label} icon`}
                    width={13}
                    height={13}
                  />
                </div>

                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      {/* Logout Button */}
      <div className="mt-auto mb-6">
        <button
          className="flex items-center gap-3 py-3 pl-7 w-full rounded transition-all cursor-pointer text-black hover:bg-gray-100"
          // Add your logout logic to onClick if needed
          type="button"
        >
          <Image
            src="/icons/log-out.svg"
            alt="Logout"
            width={18}
            height={18}
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ScholarSidebar;
