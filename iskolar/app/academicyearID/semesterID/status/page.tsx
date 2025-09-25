  'use client';

  import Image from "next/image";
  import { useState, useRef, useEffect } from "react";
  import { supabase } from "@/lib/supabaseClient";

  const hoverClassName = "transition-all duration-200 hover:shadow-lg hover:scale-[1.01]";

  export default function ApplicationStatusPage() {
    const [open, setOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
      const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('email_address', user.email)
            .single();
          
          if (userData) {
            setUserName(`${userData.first_name} ${userData.last_name}`);
          }
        }
      };

      fetchUserData();
    }, []);

    // Fix: Explicitly type status as a union of possible values
    const [status] = useState<"Approved" | "Pending" | "Rejected">("Approved");

    const statusColor = {
      Approved: "bg-green-100 text-green-700 border-green-300",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
    }[status] || "bg-gray-100 text-gray-700 border-gray-300";

    const statusIcon = {
      Approved: "/icons/green-check.svg",
      Pending: "/icons/pending.svg",
      Rejected: "/icons/rejected.svg",
    }[status] || "/icons/info.svg";

    // Example disbursement data
    const disbursement = {
      status: status === "Approved" ? "Scheduled" : status === "Pending" ? "Not yet scheduled" : "Not applicable",
      date: status === "Approved" ? "September 15, 2025" : "",
      remarks: status === "Approved"
        ? "Please check your bank account on the scheduled date."
        : status === "Pending"
        ? "Disbursement will be scheduled once your application is approved."
        : "No disbursement for rejected applications.",
    };

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
          <span className="text-lg font-semibold pl-2">Status</span>
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
              <span className="absolute top-1 left-7">
                <span className="block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white notification-pulse"></span>
              </span>
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
                {userName || 'Loading...'}
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                Scholar
              </span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="w-full max-w-2xl flex flex-col gap-8 px-8 pb-12 pt-[90px]">
          {/* Status Card */}
          <div className={`rounded-xl shadow-md ${statusColor} flex items-center gap-6 px-8 py-8 ${hoverClassName}`}>
            <div className="bg-white rounded-full p-3 shadow-md">
              <Image src={statusIcon} alt={status} width={45} height={45} />
            </div>
            <div>
              <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                {status}
                {status === "Approved" && <span className="text-sm bg-green-200 text-green-800 px-3 py-0.5 rounded-full">✨ Congratulations</span>}
              </div>
              <div className="text-gray-700 text-sm leading-relaxed">
                {status === "Approved" && (
                  <>Congratulations! Your application has been approved. Please check your email for further instructions.</>
                )}
                {status === "Pending" && (
                  <>Your application is currently being reviewed. You will be notified once a decision has been made.</>
                )}
                {status === "Rejected" && (
                  <>We regret to inform you that your application was not approved. Please contact support for more information.</>
                )}
              </div>
            </div>
          </div>

          {/* Disbursement Schedule */}
          <div className="bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] rounded-xl shadow p-7 border border-[#B6D6F6] flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/icons/schedule.svg" alt="Schedule" width={26} height={26} />
              <span className="font-semibold text-[#1976d2] text-lg">Disbursement Schedule</span>
            </div>
            <hr className="border-[#B6D6F6] mb-2" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-40">Status:</span>
                <span className={
                  disbursement.status === "Scheduled"
                    ? "bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold border border-green-200"
                    : disbursement.status === "Not yet scheduled"
                    ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold border border-yellow-200"
                    : "bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold border border-gray-200"
                }>
                  {disbursement.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-40">Date:</span>
                <span className="text-sm">
                  {disbursement.date
                    ? <span className="font-semibold text-[#1976d2]">{disbursement.date}</span>
                    : <span className="italic text-gray-400">TBA</span>}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-700 w-40">Remarks:</span>
                <span className="text-sm text-gray-600">{disbursement.remarks}</span>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/personal.svg" alt="Personal" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Application Details</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h3>
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
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="hazel.mones@example.com" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="+639123456789" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Female" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="January 15, 2000" readOnly />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 1 (House/Unit/Building + Street)</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="123 Main Street, Unit 4A" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 2 (Subdivision/Village/Purok/Sitio) <span className="text-gray-400">(optional)</span></label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Sample Subdivision" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Barangay</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Sample Barangay" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City/Municipality</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Makati City" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Province</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Metro Manila" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ZIP Code</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="1234" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Region <span className="text-gray-400">(auto-derived)</span></label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="NCR" readOnly />
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Educational Background</h3>
                <div className="grid grid-cols-1 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Junior High School</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="St. Mary's Junior High School - 123 Education Ave, Manila" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Senior High School</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="St. Mary's Senior High School - 123 Education Ave, Manila" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Current College</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Asia Pacific College - 3 Humabon Place, Makati" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Course</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="BS Information Technology" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Year Level</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="3rd Year" readOnly />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Maiden Name</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Maria Santos" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mother&apos;s Occupation</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Teacher" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Father&apos;s Name</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Juan Mones" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Father&apos;s Occupation</label>
                    <input className="w-full bg-gray-100 rounded px-3 py-2 text-sm" value="Engineer" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/documents.svg" alt="Documents" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Submitted Documents</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">PSA Birth Certificate</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">psabirthcert.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Voter's Certification</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">votercert.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">School ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">schoolid.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              {/* Certificate of Registration */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Certificate of Registration</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">regcert.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              {/* Certificate of Grades */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Certificate of Grades</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">grades.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              {/* School ID */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">School ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9] group hover:bg-[#e3f2fd] transition-colors">
                  <span className="text-xs text-gray-700 truncate">schoolid.pdf</span>
                  <a href="#" className="ml-auto text-[#1976d2] text-xs font-medium hover:underline flex items-center gap-1">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-0.5 transition-transform">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }