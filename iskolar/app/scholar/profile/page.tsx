'use client';

import Image from "next/image";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Refs for each card section
  const accountRef = useRef<HTMLDivElement | null>(null);
  const personalRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const addressRef = useRef<HTMLDivElement | null>(null);
  const programRef = useRef<HTMLDivElement | null>(null);
  const documentsRef = useRef<HTMLDivElement | null>(null);

  // Scroll to section helper
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64">
      {/* Header */}
      <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
        <Image
          src="/icons/menu.svg"
          alt="Menu"
          width={15}
          height={15}
          className="transition-all duration-300"
        />
        <span className="text-lg font-semibold pl-2">Profile</span>
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
            {/* Modal Dropdown */}
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
      <div className="pt-[90px] flex max-w-7xl mx-auto gap-8 px-8 items-start">
        {/* Left Column */}
        <div className="w-1/5 min-w-[220px] flex flex-col items-stretch">
          <div className="bg-white rounded-xl shadow p-6 sticky top-[80px] flex flex-col h-fit">
            <div className="font-semibold text-gray-700 mb-1 text-lg">Manage Profile</div>
            <div className="text-sm text-gray-400 mb-4">You can manage your profile here.</div>
            <nav className="flex flex-col gap-2">
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(accountRef)}
                type="button"
              >
                <Image src="/icons/account.svg" alt="Account" width={17} height={17} />
                Account
              </button>
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(personalRef)}
                type="button"
              >
                <Image src="/icons/personal.svg" alt="Personal" width={17} height={17} />
                Personal
              </button>
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(contactRef)}
                type="button"
              >
                <Image src="/icons/contact.svg" alt="Contact" width={16.5} height={16.5} />
                Contact
              </button>
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(addressRef)}
                type="button"
              >
                <Image src="/icons/address.svg" alt="Address" width={20} height={20} />
                Address
              </button>
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(programRef)}
                type="button"
              >
                <Image src="/icons/program.svg" alt="Program" width={16} height={16} />
                Program
              </button>
              {/* Documents Button */}
              <button
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => scrollToSection(documentsRef)}
                type="button"
              >
                <Image src="/icons/documents.svg" alt="Documents" width={17} height={17} />
                Documents
              </button>
            </nav>
          </div>
          <button className="cursor-pointer mt-6 bg-[#2196f3] text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-[#1976d2] transition">
            Edit Profile
          </button>
        </div>
        {/* Right Column */}
        <div
          className="w-4/5 flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
        >
          {/* Hide scrollbar for Chrome, Safari and Opera */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Account Section */}
          <div ref={accountRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/account.svg" alt="Account" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Account</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Scholar ID</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="XXXX-XXXX" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="example@gmail.com" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="••••••••••••••••" readOnly />
              </div>
              <div>
                <button className="text-xs text-red-500 font-medium mt-2">Change Password</button>
              </div>
            </div>
          </div>
          {/* Personal Section */}
          <div ref={personalRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/personal.svg" alt="Personal" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Personal</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Mones" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Hazel Ann" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Besafez" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gender</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Female" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="04/08/2004" readOnly />
              </div>
            </div>
          </div>
          {/* Contact Section */}
          <div ref={contactRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/contact.svg" alt="Contact" width={18.5} height={18.5} />
              <span className="font-semibold text-gray-700 text-lg">Contact</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="example@gmail.com" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="+639XXXXXXXXX" readOnly />
              </div>
            </div>
          </div>
          {/* Address Section */}
          <div ref={addressRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/address.svg" alt="Address" width={22} height={22} />
              <span className="font-semibold text-gray-700 text-lg">Address</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Present Address</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Mones" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Permanent Address</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Female" readOnly />
              </div>
            </div>
          </div>
          {/* Program Section */}
          <div ref={programRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/program.svg" alt="Program" width={18} height={18} />
              <span className="font-semibold text-gray-700 text-lg">Program</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">College/University</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Asia Pacific College" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Bachelor of Science in Computer Science" readOnly />
              </div>
            </div>
          </div>
          {/* Documents Section */}
          <div ref={documentsRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/documents.svg" alt="Documents" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Documents</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">PSA Birth Certificate</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="psabirthcert.pdf" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Voter&apos;s Certification</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="votercert.pdf" readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">National ID</label>
                <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="nationalid.pdf" readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}