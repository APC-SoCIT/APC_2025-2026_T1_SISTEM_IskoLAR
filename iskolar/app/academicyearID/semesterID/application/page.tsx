'use client';

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Common input style
const inputClassName = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#2196f3] focus:border-[#2196f3] focus:outline-none bg-white hover:border-gray-400";

export default function ApplicationPage() {
  // Stepper state: 0 = Personal Info, 1 = Documents
  const [step, setStep] = useState(0);
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

  // Personal Info
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  // Address states
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [region, setRegion] = useState("");

  // Dropdown data for address fields
  const provincesData = {
    "Metro Manila": ["Makati City", "Quezon City", "Manila", "Pasig City", "Taguig City", "Marikina City", "Mandaluyong City", "San Juan City", "Caloocan City", "Malabon City", "Navotas City", "Las Piñas City", "Parañaque City", "Muntinlupa City", "Pateros", "Valenzuela City"],
    "Laguna": ["Calamba City", "San Pablo City", "Biñan City", "Santa Rosa City", "Los Baños", "Cabuyao", "San Pedro", "Alaminos", "Bay", "Calauan", "Cavinti", "Famy", "Kalayaan", "Liliw", "Luisiana", "Lumban", "Mabitac", "Magdalena", "Majayjay", "Nagcarlan", "Paete", "Pagsanjan", "Pakil", "Pangil", "Pila", "Rizal", "Santa Cruz", "Santa Maria", "Siniloan", "Victoria"],
    "Cavite": ["Bacoor", "Cavite City", "Dasmariñas", "Imus", "Tagaytay City", "Trece Martires City", "Alfonso", "Amadeo", "Carmona", "General Mariano Alvarez", "General Emilio Aguinaldo", "General Trias", "Indang", "Kawit", "Magallanes", "Maragondon", "Mendez", "Naic", "Noveleta", "Rosario", "Silang", "Tanza", "Ternate"],
    "Rizal": ["Antipolo City", "Taytay", "Cainta", "Angono", "Baras", "Binangonan", "Cardona", "Jalajala", "Morong", "Pililla", "Rodriguez", "San Mateo", "Tanay", "Teresa"],
    "Bulacan": ["Malolos City", "Meycauayan City", "San Jose del Monte City", "Angat", "Balagtas", "Baliuag", "Bocaue", "Bulakan", "Bustos", "Calumpit", "Doña Remedios Trinidad", "Guiguinto", "Hagonoy", "Marilao", "Norzagaray", "Obando", "Pandi", "Paombong", "Plaridel", "Pulilan", "San Ildefonso", "San Miguel", "San Rafael", "Santa Maria"],
    "Pampanga": ["Angeles City", "San Fernando City", "Apalit", "Arayat", "Bacolor", "Candaba", "Floridablanca", "Guagua", "Lubao", "Mabalacat", "Macabebe", "Magalang", "Masantol", "Mexico", "Minalin", "Porac", "San Luis", "San Simon", "Santa Ana", "Santa Rita", "Santo Tomas", "Sasmuan"],
    "Batangas": ["Batangas City", "Lipa City", "Tanauan City", "Agoncillo", "Alitagtag", "Balayan", "Balete", "Bauan", "Calaca", "Calatagan", "Cuenca", "Ibaan", "Laurel", "Lemery", "Lian", "Lobo", "Mabini", "Malvar", "Mataasnakahoy", "Nasugbu", "Padre Garcia", "Rosario", "San Jose", "San Juan", "San Luis", "San Nicolas", "San Pascual", "Santa Teresita", "Santo Tomas", "Taal", "Talisay", "Taysan", "Tingloy", "Tuy"]
  };

  const regionsData = {
    "Metro Manila": "NCR",
    "Laguna": "CALABARZON",
    "Cavite": "CALABARZON", 
    "Rizal": "CALABARZON",
    "Bulacan": "Central Luzon",
    "Pampanga": "Central Luzon",
    "Batangas": "CALABARZON"
  };

  // Helper function to get cities based on province
  const getCitiesByProvince = (province: string) => {
    return provincesData[province as keyof typeof provincesData] || [];
  };

  // Helper function to get region by province
  const getRegionByProvince = (province: string) => {
    return regionsData[province as keyof typeof regionsData] || "";
  };

  // Validation functions
  const validateZipCode = (zipCode: string) => {
    return /^\d{4}$/.test(zipCode);
  };

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

  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex flex-col items-center">
      {/* Header */}
      <div className="fixed top-0 left-64 right-0 z-10 h-[60px] bg-white border-b border-gray-300 flex items-center gap-2 px-5">
        <Image src="/icons/menu.svg" alt="Menu" width={15} height={15} />
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
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 1 (House/Unit/Building + Street) <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="123 Main Street, Unit 4A" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 2 (Subdivision/Village/Purok/Sitio) <span className="text-gray-400">(optional)</span></label>
                    <input className={inputClassName} value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Sample Subdivision" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Barangay <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={barangay} onChange={e => setBarangay(e.target.value)} placeholder="Sample Barangay" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City/Municipality <span className="text-red-500">*</span></label>
                    <select required className={inputClassName} value={city} onChange={e => {
                      setCity(e.target.value);
                      const region = getRegionByProvince(province);
                      setRegion(region);
                    }}>
                      <option value="">Select City</option>
                      {getCitiesByProvince(province).map(cityOption => (
                        <option key={cityOption} value={cityOption}>{cityOption}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Province <span className="text-red-500">*</span></label>
                    <select required className={inputClassName} value={province} onChange={e => {
                      setProvince(e.target.value);
                      const cities = getCitiesByProvince(e.target.value);
                      if (cities.length > 0) {
                        setCity(cities[0]);
                      }
                      const region = getRegionByProvince(e.target.value);
                      setRegion(region);
                    }}>
                      <option value="">Select Province</option>
                      {Object.keys(provincesData).map(provinceOption => (
                        <option key={provinceOption} value={provinceOption}>{provinceOption}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ZIP Code <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={zipCode} onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setZipCode(value);
                    }} placeholder="1234" maxLength={4} />
                    {zipCode && !validateZipCode(zipCode) && (
                      <p className="text-xs text-red-500 mt-1">ZIP code must be exactly 4 digits</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Region <span className="text-gray-400">(auto-derived)</span></label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={region} readOnly />
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