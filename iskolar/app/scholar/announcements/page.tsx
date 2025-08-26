'use client';

import Image from "next/image";
import { useState, useRef } from "react";

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#f5f6fa] pl-64">
      {/* Header - already implemented above */}
      <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
        <Image
          src="/icons/menu.svg"
          alt="Menu"
          width={15}
          height={15}
          className="transition-all duration-300"
        />
        <span className="text-base font-semibold pl-2">Announcements</span>
        <div className="ml-auto flex items-center gap-6">
          {/* Notification Icon */}
          <div
            ref={notifRef}
            className="relative flex items-center justify-center cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100">
              <Image
                src="/icons/notification.svg"
                alt="Notifications"
                width={15}
                height={15}
              />
            </span>
            <span className="absolute top-1 left-7 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            {/* Modal Dropdown - always directly below the notification */}
            {open && (
              <div className="absolute right-0" style={{ marginTop: "14rem" }}>
                <div className="w-[380px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3 flex flex-col gap-2">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 border border-gray-200 rounded-md bg-white p-2"
                    >
                      <span className="flex items-center justify-center h-full ml-2">
                        <Image
                          src="/icons/green-check.svg"
                          alt="Approved"
                          width={28}
                          height={28}
                        />
                      </span>
                      <div>
                        <div className="mt-2 font-semibold text-[#219174] text-[15px] leading-tight">
                          Your application has been approved!
                        </div>
                        <div className="mb-2 text-gray-500 text-xs mt-1">
                          For more details, please go to &quot;Status&quot; page.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Name and Role */}
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              Hazel Mones
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              Scholar
            </span>
          </div>
        </div>
      </div>
      {/* Main content area */}
      <div className="pt-[60px] max-w-4xl mx-auto w-full">
        <div className="mt-12 flex justify-center">
          <div className="w-full">
            <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
              <div className="flex items-center gap-2 px-8 py-5 border-b border-gray-100 bg-[#f3f6fd]">
                <Image
                  src="/icons/announcement.svg"
                  alt="Announcement"
                  width={22}
                  height={22}
                  className="text-gray-500"
                />
                <span className="font-semibold text-gray-800 text-lg">Announcement</span>
              </div>
              <div className="px-8 py-8 min-h-[120px] bg-[#fcfcff]">
                {/* Sample Announcement */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#219174] font-medium text-base">[System Update]</span>
                    <span className="text-xs text-gray-400">August 26, 2025</span>
                  </div>
                  <div className="font-semibold text-gray-800 text-lg mb-1">
                    Welcome to the new IskoLAR Portal!
                  </div>
                  <div className="text-gray-600 text-base">
                    We are excited to announce the launch of our newly improved portal. Enjoy a more seamless experience as you manage your scholarship requirements and stay updated with the latest announcements.
                  </div>
                </div>
                {/* Add more announcements here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}