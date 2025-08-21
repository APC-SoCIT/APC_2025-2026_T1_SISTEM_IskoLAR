'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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
      icon: '/icons/announcements.svg',
    },
    {
      label: 'Profile',
      href: '/scholar/profile',
      icon: '/icons/profile.svg',
    },
  ];

  const extraItems = [
    {
      label: 'User Manual',
      href: '/scholar/user-manual',
      icon: '/icons/manual.svg',
    },
  ];

  const semesterSubItems = [
    { label: 'Application', href: '/scholar/program/application' },
    { label: 'Status', href: '/scholar/program/status' },
  ];

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-64 font-geist flex flex-col border-r bg-white border-gray-300">
      {/* Logo & Title */}
      <div className="p-6 border-b flex items-center gap-2 border-gray-300">
        <Image
          src="/IskoLAR.png"
          alt="IskoLAR logo"
          width={28}
          height={28}
          className="transition-all duration-300"
        />
        <span className="text-lg font-semibold">IskoLAR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1">
        {/* Main Section Title */}
        <div className="flex items-center gap-3 py-2 px-4 pl-8">
          <div className="w-5 flex justify-center">
            <span className="text-sm font-semibold text-gray-500">Main</span>
          </div>
        </div>

        {/* Normal Nav Items */}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 px-4 pl-8 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-black font-medium'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}

                <div className="w-5 flex justify-center">
                  {isActive && item.icon && (
                    <Image
                      src={item.icon}
                      alt={`${item.label} icon`}
                      width={18}
                      height={18}
                    />
                  )}
                </div>

                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Program Dropdown */}
        <div
          className={`flex items-center gap-3 py-3 px-4 pl-8 transition-all cursor-pointer relative ${
            pathname.startsWith('/scholar/program')
              ? 'bg-[#E3F2FD] text-black font-medium'
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
          {pathname.startsWith('/scholar/program') && (
            <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
          )}

          <div className="w-5 flex justify-center" />

          <span>Program</span>

          <div className="ml-auto">
            {isProgramOpen ? (
              <Image
                src="/icons/chevron_down.svg"
                alt="Collapse Program"
                width={10}
                height={10}
              />
            ) : (
              <Image
                src="/icons/chevron_left.svg"
                alt="Expand Program"
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
              className={`flex items-center justify-between py-3 px-4 pl-12 transition-all cursor-pointer relative ${
                pathname.includes('/scholar/program/1st-semester') ||
                pathname.includes('/scholar/program/2nd-semester')
                  ? 'bg-[#E3F2FD] text-black font-medium'
                  : 'text-black hover:bg-gray-100'
              }`}
              style={{ marginLeft: '2rem' }}
              onClick={() => setIsSchoolYearOpen(!isSchoolYearOpen)}
            >
              <span>School Year</span>

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
            </div>

            {/* Semesters under School Year */}
            {isSchoolYearOpen && (
              <div>
                {/* 1st Semester */}
                <div
                  className="flex items-center justify-between py-3 px-4 pl-16 cursor-pointer hover:bg-gray-100"
                  style={{ marginLeft: '2rem' }}
                  onClick={() => setIsFirstSemOpen(!isFirstSemOpen)}
                >
                  <span>1st Semester</span>
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
                </div>

                {isFirstSemOpen && (
                  <div>
                    {semesterSubItems.map((sub) => {
                      const isActive =
                        pathname === sub.href || pathname.startsWith(sub.href);

                      return (
                        <Link href={sub.href} key={`1st-${sub.label}`}>
                          <div
                            className={`flex items-center py-3 px-4 pl-24 transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-[#E3F2FD] text-black font-medium'
                                : 'text-black hover:bg-gray-100'
                            }`}
                            style={{ marginLeft: '1rem' }}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                            )}
                            <span>{sub.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 2nd Semester */}
                <div
                  className="flex items-center justify-between py-3 px-4 pl-16 cursor-pointer hover:bg-gray-100"
                  style={{ marginLeft: '2rem' }}
                  onClick={() => setIsSecondSemOpen(!isSecondSemOpen)}
                >
                  <span>2nd Semester</span>
                  {isSecondSemOpen ? (
                    <Image
                      src="/icons/chevron_down.svg"
                      alt="Collapse 2nd Semester"
                      width={11}
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
                </div>

                {isSecondSemOpen && (
                  <div>
                    {semesterSubItems.map((sub) => {
                      const isActive =
                        pathname === sub.href || pathname.startsWith(sub.href);

                      return (
                        <Link href={sub.href} key={`2nd-${sub.label}`}>
                          <div
                            className={`flex items-center py-3 px-4 pl-20 transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-[#E3F2FD] text-black font-medium'
                                : 'text-black hover:bg-gray-100'
                            }`}
                            style={{ marginLeft: '2rem' }}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                            )}
                            <span>{sub.label}</span>
                          </div>
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
        <div className="mt-4 flex items-center gap-3 py-2 px-4 pl-8">
          <div className="w-5 flex justify-center">
            <span className="text-sm font-semibold text-gray-500">Extras</span>
          </div>
        </div>

        {extraItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex items-center gap-3 py-3 px-4 pl-8 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#E3F2FD] text-black font-medium'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
                )}

                <div className="w-5 flex justify-center">
                  {isActive && item.icon && (
                    <Image
                      src={item.icon}
                      alt={`${item.label} icon`}
                      width={14}
                      height={14}
                    />
                  )}
                </div>

                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ScholarSidebar;
