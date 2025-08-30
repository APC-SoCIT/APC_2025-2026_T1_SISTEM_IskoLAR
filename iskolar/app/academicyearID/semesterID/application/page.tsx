'use client';

import Image from "next/image";
import { useState, useRef } from "react";

export default function ApplicationPage() {
  // Stepper state: 0 = Personal Info, 1 = Documents
  const [step, setStep] = useState(0);

  // Personal Info
  const [scholarId, setScholarId] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherJob, setMotherJob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherJob, setFatherJob] = useState("");

  // Document Uploads
  const [, setRegFile] = useState<File | null>(null);
  const [regFileName, setRegFileName] = useState("");
  const [, setGradesFile] = useState<File | null>(null);
  const [gradesFileName, setGradesFileName] = useState("");
  const [, setIdFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState("");
  const [] = useState<File | null>(null);
  const [] = useState("");
  const [] = useState<File | null>(null);
  const [] = useState("");

  const steps = [
    { label: "Personal" },
    { label: "Documents" },
  ];

  const [open, setOpen] = useState(false); // <-- add this line for notification modal
  const notifRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex flex-col items-center">
      {/* Header */}
      <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
        <Image
          src="/icons/menu.svg"
          alt="Menu"
          width={15}
          height={15}
          className="transition-all duration-300"
        />
        <span className="text-lg font-semibold pl-2">Application</span>
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

      {/* Stepper */}
      <div className="w-full flex flex-col items-center pt-[80px] pb-6">
        <div className="flex justify-center w-full">
            <div className="flex items-center max-w-3xl px-8 mx-auto">
                {steps.map((stepObj, idx) => (
                <div key={stepObj.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                    <div
                        className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white
                        ${idx <= step ? "bg-[#2196f3]" : "bg-gray-300"}
                        `}
                    >
                        {idx + 1}
                    </div>
                    <span className="text-xs mt-1 text-gray-700">{stepObj.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                    <div className={`h-1 w-80 mx-2 ${idx < step ? "bg-[#2196f3]" : "bg-gray-300"}`}></div>
                    )}
                </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full max-w-3xl flex flex-col gap-6 px-8 pb-12">
        {step === 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/personal.svg" alt="Personal" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Personal Information</span>
            </div>
            <hr className="border-gray-200 mb-4" />

            {/* Scholar ID */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Scholar ID</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={scholarId}
                  onChange={e => setScholarId(e.target.value)}
                />
              </div>
            </div>

            {/* Name and Contact */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  type="tel"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-6 mb-2 font-semibold text-gray-700">Address</div>
            <div className="flex flex-col gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Present Address</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={presentAddress}
                  onChange={e => setPresentAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Permanent Address</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={permanentAddress}
                  onChange={e => setPermanentAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Guardian Information */}
            <div className="mt-6 mb-2 font-semibold text-gray-700">Guardian Information</div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Full Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={motherName}
                  onChange={e => setMotherName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Occupation</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={motherJob}
                  onChange={e => setMotherJob(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Father&apos;s Full Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Father&apos;s Occupation</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
                  value={fatherJob}
                  onChange={e => setFatherJob(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                className="cursor-pointer bg-[#2196f3] text-white px-8 py-2 rounded-lg font-medium shadow hover:bg-[#1976d2] transition"
                onClick={() => setStep(1)}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/documents.svg" alt="Documents" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Required Documents</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="mb-6 bg-gradient-to-r from-[#e3f2fd] to-[#f8fafc] rounded-xl px-5 py-4 border border-[#B6D6F6] shadow-sm flex flex-col justify-center">
              <div className="text-[15px] text-[#1976d2] font-semibold">
                Upload the following documents to complete your application.
              </div>
              <div className="text-xs text-gray-500">
                Please upload clear and valid copies of your documents below.
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {/* Certificate of Registration */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Certificate of Registration</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setRegFile(e.target.files[0]);
                        setRegFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{regFileName}</span>
                </div>
              </div>
              {/* Certificate of Grades */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Certificate of Grades</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setGradesFile(e.target.files[0]);
                        setGradesFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{gradesFileName}</span>
                </div>
              </div>
              {/* School ID */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">School ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setIdFile(e.target.files[0]);
                        setIdFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{idFileName}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="cursor-pointer bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-medium shadow hover:bg-gray-300 transition"
                onClick={() => setStep(0)}
                type="button"
              >
                Back
              </button>
              <button
                className="cursor-pointer bg-[#2196f3] text-white px-8 py-2 rounded-lg font-medium shadow hover:bg-[#1976d2] transition"
                onClick={() => alert("Submitted!")}
                type="button"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}