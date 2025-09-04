'use client';

import Image from "next/image";
import { useState } from "react";

// Common input style
const inputClassName = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#2196f3] focus:border-[#2196f3] focus:outline-none bg-white hover:border-gray-400";

export default function ApplicationPage() {
  // Stepper state: 0 = Personal Info, 1 = Documents
  const [step, setStep] = useState(0);

  // Personal Info
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [juniorHighName, setJuniorHighName] = useState("");
  const [juniorHighAddress, setJuniorHighAddress] = useState("");
  const [seniorHighName, setSeniorHighName] = useState("");
  const [seniorHighAddress, setSeniorHighAddress] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeAddress, setCollegeAddress] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [course, setCourse] = useState("");
  const [motherMaidenName, setMotherMaidenName] = useState("");
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

  const steps = [
    { label: "Personal" },
    { label: "Documents" },
  ];

  const [] = useState(false); 

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex flex-col items-center">
      {/* Header */}
      <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
        <Image src="/icons/menu.svg" alt="Menu" width={15} height={15} />
        <span className="text-lg font-semibold pl-2">Application</span>
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
                      ${idx <= step ? "bg-[#2196f3] shadow-lg shadow-blue-200" : "bg-gray-300"} 
                      transition-all duration-300 transform ${idx === step ? "scale-110" : ""}`}
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

            {/* Add spacing and grouping */}
            <div className="space-y-8">
              {/* Group related fields */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                {/* Name and Contact */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
                    <input className={inputClassName} value={middleName} onChange={e => setMiddleName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input required type="email" className={inputClassName} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                    <input required type="tel" className={inputClassName} value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                  </div>
                </div>

                {/* Gender & Birthdate */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select required className={inputClassName} value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Birthdate <span className="text-red-500">*</span></label>
                    <input required type="date" className={inputClassName} value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6 mb-2 font-semibold text-gray-700">Address</div>
                <div className="flex flex-col gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Present Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={presentAddress} onChange={e => setPresentAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Permanent Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} />
                  </div>
                </div>

                {/* Education */}
                <div className="mt-6 mb-2 font-semibold text-gray-700">Educational Background</div>
                <div className="flex flex-col gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Junior High School Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={juniorHighName} onChange={e => setJuniorHighName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Junior High School Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={juniorHighAddress} onChange={e => setJuniorHighAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Senior High School Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={seniorHighName} onChange={e => setSeniorHighName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Senior High School Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={seniorHighAddress} onChange={e => setSeniorHighAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">College School Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">College School Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={collegeAddress} onChange={e => setCollegeAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Year Level <span className="text-red-500">*</span></label>
                    <select required className={inputClassName} value={yearLevel} onChange={e => setYearLevel(e.target.value)}>
                      <option value="">Select Year Level</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Course <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={course} onChange={e => setCourse(e.target.value)} />
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="mt-6 mb-2 font-semibold text-gray-700">Guardian Information</div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Maiden Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={motherMaidenName} onChange={e => setMotherMaidenName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Occupation</label>
                    <input className={inputClassName} value={motherJob} onChange={e => setMotherJob(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Father&apos;s Full Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={fatherName} onChange={e => setFatherName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Father&apos;s Occupation</label>
                    <input className={inputClassName} value={fatherJob} onChange={e => setFatherJob(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button className="cursor-pointer bg-[#2196f3] text-white px-8 py-2 rounded-lg font-medium shadow hover:bg-[#1976d2] transition" onClick={() => setStep(1)} type="button">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Documents (unchanged) */}
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