"use client";
 
import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Course data
const courseData = [
    { name: "BS Accountancy" },
    { name: "BS Accounting Technology" },
    { name: "BS Aeronautical Engineering" },
    { name: "BS Agricultural Engineering" },
    { name: "BS Agriculture" },
    { name: "BS Agribusiness Management" },
    { name: "BS Animal Science" },
    { name: "BS Applied Mathematics" },
    { name: "BS Architecture" },
    { name: "BS Art Studies" },
    { name: "BS Banking and Finance" },
    { name: "BS Behavioral Science" },
    { name: "BS Biology" },
    { name: "BS Broadcast Communication" },
    { name: "BS Business Administration" },
    { name: "BS Business Management" },
    { name: "BS Chemical Engineering" },
    { name: "BS Chemistry" },
    { name: "BS Civil Engineering" },
    { name: "BS Communication Arts" },
    { name: "BS Community Development" },
    { name: "BS Computer Engineering" },
    { name: "BS Computer Science" },
    { name: "BS Criminology" },
    { name: "BS Culinary Arts" },
    { name: "BS Customs Administration" },
    { name: "BS Data Science" },
    { name: "BS Dentistry" },
    { name: "BS Development Communication" },
    { name: "BS Digital Marketing" },
    { name: "BS Drafting Technology" },
    { name: "BS Early Childhood Education" },
    { name: "BS Economics" },
    { name: "BS Education" },
    { name: "BS Electrical Engineering" },
    { name: "BS Electronics and Communications Engineering" },
    { name: "BS Elementary Education" },
    { name: "BS Entrepreneurship" },
    { name: "BS Environmental Science" },
    { name: "BS Fine Arts" },
    { name: "BS Fisheries" },
    { name: "BS Food Technology" },
    { name: "BS Forestry" },
    { name: "BS Game Development" },
    { name: "BS Geology" },
    { name: "BS Graphic Design" },
    { name: "BS Guidance and Counseling" },
    { name: "BS History" },
    { name: "BS Hospitality Management" },
    { name: "BS Hotel and Restaurant Management" },
    { name: "BS Human Resource Development Management" },
    { name: "BS Industrial Engineering" },
    { name: "BS Industrial Technology" },
    { name: "BS Information Systems" },
    { name: "BS Information Technology" },
    { name: "BS Interior Design" },
    { name: "BS International Relations" },
    { name: "BS Journalism" },
    { name: "BS Law" },
    { name: "BS Library and Information Science" },
    { name: "BS Linguistics" },
    { name: "BS Literature" },
    { name: "BS Management Accounting" },
    { name: "BS Marine Biology" },
    { name: "BS Marine Engineering" },
    { name: "BS Marketing Management" },
    { name: "BS Mass Communication" },
    { name: "BS Mathematics" },
    { name: "BS Mechanical Engineering" },
    { name: "BS Medical Laboratory Science (Medical Technology)" },
    { name: "BS Midwifery" },
    { name: "BS Multimedia Arts" },
    { name: "BS Music" },
    { name: "BS Nursing" },
    { name: "BS Nutrition and Dietetics" },
    { name: "BS Pharmacy" },
    { name: "BS Philosophy" },
    { name: "BS Physical Education" },
    { name: "BS Physical Therapy" },
    { name: "BS Physics" },
    { name: "BS Political Science" },
    { name: "BS Psychology" },
    { name: "BS Public Administration" },
    { name: "BS Radiologic Technology" },
    { name: "BS Real Estate Management" },
    { name: "BS Religious Studies" },
    { name: "BS Secondary Education" },
    { name: "BS Social Work" },
    { name: "BS Sociology" },
    { name: "BS Software Engineering" },
    { name: "BS Special Education" },
    { name: "BS Sports Science" },
    { name: "BS Statistics" },
    { name: "BS Technical-Vocational Education" },
    { name: "BS Theater Arts" },
    { name: "BS Tourism Management" },
    { name: "BS Transportation Management" },
    { name: "BS Veterinary Medicine" },
    { name: "BS Visual Communication" }
];

// College/University data
const collegeData = [
    { name: "Adamson University" },
    { name: "AMA Computer University" },
    { name: "Arellano University" },
    { name: "Asia Pacific College" },
    { name: "Asian Institute of Journalism and Communication" },
    { name: "Asian Institute of Management" },
    { name: "Asian Institute of Maritime Studies" },
    { name: "Asian Social Institute" },
    { name: "Assumption College San Lorenzo" },
    { name: "Ateneo de Manila University" },
    { name: "Central Colleges of the Philippines" },
    { name: "Centro Escolar University" },
    { name: "Chiang Kai Shek College" },
    { name: "Colegio de San Juan de Letran" },
    { name: "College of the Holy Spirit" },
    { name: "De La Salle University" },
    { name: "De La Salle-College of Saint Benilde" },
    { name: "Don Bosco Technical College" },
    { name: "Emilio Aguinaldo College" },
    { name: "Eulogio \"Amang\" Rodriguez Institute of Science and Technology" },
    { name: "Far Eastern University" },
    { name: "FEATI University" },
    { name: "FEU Institute of Technology" },
    { name: "José Rizal University" },
    { name: "La Consolacion College Manila" },
    { name: "Lyceum of the Philippines University" },
    { name: "Manila Central University" },
    { name: "Manuel L. Quezon University" },
    { name: "Mapúa University" },
    { name: "Miriam College" },
    { name: "National College of Business and Arts" },
    { name: "National Defense College of the Philippines" },
    { name: "National Teachers College" },
    { name: "National University, Philippines" },
    { name: "New Era University" },
    { name: "Olivarez College" },
    { name: "Our Lady of Fatima University" },
    { name: "Pamantasan ng Lungsod ng Maynila" },
    { name: "Pasig Catholic College" },
    { name: "PATTS College of Aeronautics" },
    { name: "Philippine Christian University" },
    { name: "Philippine Normal University" },
    { name: "Philippine School of Business Administration" },
    { name: "Polytechnic University of the Philippines" },
    { name: "Rizal Technological University" },
    { name: "Saint Jude College" },
    { name: "Saint Pedro Poveda College" },
    { name: "San Beda University" },
    { name: "Santa Isabel College" },
    { name: "St. Joseph's College of Quezon City" },
    { name: "St. Louis College Valenzuela" },
    { name: "St. Luke's College of Medicine - WHQM" },
    { name: "St. Mary's College" },
    { name: "St. Paul University Manila" },
    { name: "St. Paul University Quezon City" },
    { name: "St. Scholastica's College" },
    { name: "Technological Institute of the Philippines" },
    { name: "Technological University of the Philippines" },
    { name: "The Philippine Women's University" },
    { name: "The University of Manila" },
    { name: "Trinity University of Asia" },
    { name: "University of Asia and the Pacific" },
    { name: "University of Perpetual Help System DALTA" },
    { name: "University of Santo Tomas" },
    { name: "University of the East" },
    { name: "University of the East Ramon Magsaysay" },
    { name: "University of the Philippines Diliman" },
    { name: "University of the Philippines Manila" },
    { name: "University of the Philippines System" }
];

// Barangay data with ZIP codes
const barangayData = [
    { name: "Ayala-Paseo de Roxas", zipCode: "1226" },
    { name: "Bangkal", zipCode: "1233" },
    { name: "Bel-Air", zipCode: "1209" },
    { name: "Cembo", zipCode: "1214" },
    { name: "Comembo", zipCode: "1217" },
    { name: "Dasmarinas Village North", zipCode: "1221" },
    { name: "Dasmarinas Village South", zipCode: "1222" },
    { name: "Forbes Park North", zipCode: "1219" },
    { name: "Forbes Park South", zipCode: "1220" },
    { name: "Fort Bonifacio Naval Station", zipCode: "1202" },
    { name: "Greenbelt", zipCode: "1228" },
    { name: "Guadalupe Nuevo", zipCode: "1212" },
    { name: "Guadalupe Viejo", zipCode: "1211" },
    { name: "Kasilawan", zipCode: "1206" },
    { name: "La Paz Singkamas Tejeros", zipCode: "1204" },
    { name: "Legaspi Village", zipCode: "1229" },
    { name: "Magallanes Village", zipCode: "1232" },
    { name: "Makati Commercial Center", zipCode: "1224" },
    { name: "Makati CPO Inc. Buendia", zipCode: "1200" },
    { name: "Olympia and Carmona", zipCode: "1207" },
    { name: "Palanan", zipCode: "1235" },
    { name: "Pasong Tamo, Ecology Village", zipCode: "1231" },
    { name: "Pembo", zipCode: "1218" },
    { name: "Pinagkaisahan-Pitogo", zipCode: "1213" },
    { name: "Pio del Pilar", zipCode: "1230" },
    { name: "Poblacion", zipCode: "1210" },
    { name: "Rembo (East)", zipCode: "1216" },
    { name: "Rembo (West)", zipCode: "1215" },
    { name: "Salcedo Village", zipCode: "1227" },
    { name: "San Antonio Village", zipCode: "1203" },
    { name: "San Isidro", zipCode: "1234" },
    { name: "San Lorenzo Village", zipCode: "1223" },
    { name: "Sta. Cruz", zipCode: "1205" },
    { name: "Urdaneta Village", zipCode: "1225" },
    { name: "Valenzuela, Santiago, Rizal", zipCode: "1208" }
];

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showAddressFields, setShowAddressFields] = useState(false);
    const [showEducationFields, setShowEducationFields] = useState(false);
 
    // Personal Information fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [gender, setGender] = useState("");
    const [mobile, setMobile] = useState("");
    const [birthday, setBirthday] = useState("");
    
    // Address fields (optional)
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city] = useState("Makati City");
    const [zipCode, setZipCode] = useState("");
    
    // Education fields (optional)
    const [college, setCollege] = useState("");
    const [course, setCourse] = useState("");
    
    // UI state
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    


    // Validation function for ZIP code
    const validateZipCode = (zipCode: string) => {
        return /^\d{4}$/.test(zipCode);
    };
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
       
        // Form validation for required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !birthday || 
            !gender || !mobile || !college || !course || !addressLine1 || !barangay || !city || !zipCode) {
            setError("Please fill in all required fields.");
            return;
        }
 
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
 
        if (!agree) {
            setError("Please agree to the Data Privacy Act.");
            return;
        }
        
        // Validate ZIP code
        if (!validateZipCode(zipCode)) {
            setError("ZIP code must be exactly 4 digits.");
            return;
        }
 
        setIsLoading(true);
        setError("");
 
        try {
            const supabase = createClientComponentClient();

            // First, create the user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                },
            });

            if (authError) {
                if (authError.message === 'Email rate limit exceeded') {
                    throw new Error('Too many registration attempts. Please wait a few minutes before trying again, or use a different email address.');
                } else {
                    throw new Error(authError.message);
                }
            }

            if (!authData?.user?.id) {
                throw new Error('Failed to create user account');
            }

            // Prepare request payload for users table
            const userPayload = {
                user_id: authData.user.id,
                email_address: email,
                first_name: firstName,
                last_name: lastName,
                middle_name: middleName || null,
                gender,
                birthdate: birthday,
                mobile_number: mobile,
                address_line1: addressLine1,
                address_line2: addressLine2 || null,
                barangay: barangay,
                city: city,
                zip_code: zipCode,
                college_university: college,
                college_course: course
            };
            
            // Insert the user data into the users table
            const { error: insertError } = await supabase
                .from('users')
                .insert([userPayload]);

            if (insertError) {
                // Check for specific database constraint violations
                if (insertError.message?.includes('users_contact_number_key')) {
                    throw new Error('This mobile number is already registered. Please use a different number.');
                } else if (insertError.message?.includes('users_email_key')) {
                    throw new Error('This email address is already registered. Please use a different email.');
                } else {
                    throw new Error(insertError.message);
                }
            }

            // Show success message
            setSuccess("Please check your email for confirmation.");
            
            // Set a timeout for redirection
            setTimeout(() => {
                window.location.href = '/auth/sign-in';
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };
 
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e3f0ff] via-[#f5f7fa] to-[#e3f0ff] py-16">
            {/* Top Spacer */}
            <div className="h-8" />
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-1 text-gray-900">Welcome</h2>
                <p className="text-gray-500 mb-6">Create your account</p>
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                        {success}
                    </div>
                )}
                <form className="w-full flex flex-col gap-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="First Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </div>
                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Last Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>
                    {/* Middle Name */}
                    <div>
                        <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                            Middle Name
                        </label>
                        <input
                            id="middleName"
                            type="text"
                            placeholder="Middle Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={middleName}
                            onChange={e => setMiddleName(e.target.value)}
                        />
                    </div>
                    {/* Birthday & Gender in two columns */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Birthday */}
                        <div>
                            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                                Birthday <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="birthday"
                                type="date"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={birthday}
                                onChange={e => setBirthday(e.target.value)}
                            />
                        </div>
                        {/* Gender */}
                        <div className="relative">
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gender"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 appearance-none"
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                            </select>
                            {/* Custom down arrow icon */}
                            <span className="pointer-events-none absolute right-2 top-[55%] text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    {/* Mobile Number */}
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="mobile"
                            type="tel"
                            placeholder="09XXXXXXXXX"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                        />
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#9ca3af" strokeWidth="2" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/><path stroke="#9ca3af" strokeWidth="2" d="m4 7 8 6 8-6"/></svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="example@gmail.com"
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Section Headers */}
                    <div className="flex justify-between gap-4">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-xs border rounded-lg cursor-pointer ${showAddressFields 
                                ? 'bg-[#e3f2fd] border-[#90caf9] text-[#1976D2]' 
                                : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => setShowAddressFields(!showAddressFields)}
                        >
                            {showAddressFields ? 'Hide Address Fields' : (
                                <>
                                    Add Address Information <span className="text-red-500">*</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-xs border rounded-lg cursor-pointer ${showEducationFields 
                                ? 'bg-[#e3f2fd] border-[#90caf9] text-[#1976D2]' 
                                : 'bg-white border-gray-300 text-gray-700'}`}
                            onClick={() => setShowEducationFields(!showEducationFields)}
                        >
                            {showEducationFields ? 'Hide Education Information' : (
                                <>
                                    Add Education Information <span className="text-red-500">*</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Address Fields */}
                    {showAddressFields && (
                        <div className="border border-[#90caf9] bg-[#f8fafc] rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Address Information</h3>
                            
                            {/* Address Line 1 & 2 */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="addressLine1" className="block text-xs text-gray-600 mb-1">
                                        Address Line 1 (House/Unit/Building + Street) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="addressLine1"
                                        type="text"
                                        placeholder="123 Main Street, Unit 4A"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                        value={addressLine1}
                                        onChange={e => setAddressLine1(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="addressLine2" className="block text-xs text-gray-600 mb-1">
                                        Address Line 2 (Subdivision/Village/Purok/Sitio)
                                    </label>
                                    <input
                                        id="addressLine2"
                                        type="text"
                                        placeholder="Sample Subdivision"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                        value={addressLine2}
                                        onChange={e => setAddressLine2(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Barangay, City, ZIP */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="barangay" className="block text-xs text-gray-600 mb-1">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="barangay"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 appearance-none"
                                            value={barangay}
                                            onChange={e => {
                                                setBarangay(e.target.value);
                                                const selectedBarangay = barangayData.find(b => b.name === e.target.value);
                                                if (selectedBarangay) {
                                                    setZipCode(selectedBarangay.zipCode);
                                                }
                                            }}
                                        >
                                            <option value="">Select Barangay</option>
                                            {barangayData.map((brgy) => (
                                                <option key={brgy.name} value={brgy.name}>
                                                    {brgy.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path d="M7 10l5 5 5-5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-7">
                                        <label htmlFor="city" className="block text-xs text-gray-600 mb-1">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value="Makati City"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <label htmlFor="zipCode" className="block text-xs text-gray-600 mb-1">
                                            ZIP Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="zipCode"
                                            type="text"
                                            placeholder="1234"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900"
                                            value={zipCode}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    )}
                    
                    {/* Education Fields */}
                    {showEducationFields && (
                        <div className="border border-[#90caf9] bg-[#f8fafc] rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Education Information</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="college" className="block text-xs text-gray-600 mb-1">
                                        College/University <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="college"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 appearance-none"
                                            value={college}
                                            onChange={e => setCollege(e.target.value)}
                                        >
                                            <option value="">Select College/University</option>
                                            {collegeData.map((col) => (
                                                <option key={col.name} value={col.name}>
                                                    {col.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path d="M7 10l5 5 5-5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="course" className="block text-xs text-gray-600 mb-1">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="course"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 appearance-none"
                                            value={course}
                                            onChange={e => setCourse(e.target.value)}
                                        >
                                            <option value="">Select Course</option>
                                            {courseData.map((crs) => (
                                                <option key={crs.name} value={crs.name}>
                                                    {crs.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                <path d="M7 10l5 5 5-5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="w-full pr-10 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    // Eye-off icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9ca3af" strokeWidth="2" d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-6.5 0-10-8-10-8a17.6 17.6 0 0 1 3.07-4.36M6.12 6.12A9.98 9.98 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.07 5.36M1 1l22 22" />
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                        <path stroke="#9ca3af" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="w-full pr-10 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    // Eye-off icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9ca3af" strokeWidth="2" d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-6.5 0-10-8-10-8a17.6 17.6 0 0 1 3.07-4.36M6.12 6.12A9.98 9.98 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.07 5.36M1 1l22 22" />
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                        <path stroke="#9ca3af" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-start mb-2">
                        <label className="flex gap-2 text-sm text-gray-700 items-start">
                            <span className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={e => setAgree(e.target.checked)}
                                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded-md bg-white checked:bg-[#2196F3] checked:border-[#2196F3] focus:outline-none transition-all cursor-pointer"
                                    style={{ outline: 'none' }}
                                />
                                <span className="pointer-events-none absolute left-0 top-0 w-4 h-4 flex items-center justify-center">
                                    {agree && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                            </span>
                            <span className="ml-1 leading-snug">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    className="cursor-pointer text-[#1976D2] underline font-medium hover:opacity-80 focus:outline-none"
                                    onClick={() => setShowModal(true)}
                                >
                                    Data Privacy Act.
                                </button>
                            </span>
                        </label>
                    </div>
                    {/* Error Message Notification */}
                    {error && (
                        <div className="fixed top-4 left-1/2 z-50 animate-slideDown">
                            <div className="transform -translate-x-1/2">
                                <div className="mx-4 inline-block min-w-[280px] max-w-[90vw]">
                                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-lg transition-all duration-200">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-red-800 whitespace-normal break-words">{error}</p>
                                            </div>
                                            <div className="ml-auto pl-3">
                                                <div className="-mx-1.5 -my-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setError("")}
                                                        className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                                                    >
                                                        <span className="sr-only">Dismiss</span>
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className={`cursor-pointer w-full py-2 rounded-lg bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-lg shadow hover:opacity-90 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                {/* Modal for Terms and Conditions */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fadeIn">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full px-8 py-7 relative animate-scaleIn">
                            <button
                                type="button"
                                className="absolute top-4 right-4 text-gray-400 hover:text-[#D32F2F] focus:outline-none cursor-pointer"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                                </svg>
                            </button>
                            <h3 className="text-2xl font-extrabold mb-3 text-gray-900 text-center">Data Privacy Act</h3>
                            <div className="text-gray-700 text-base space-y-3 max-h-72 overflow-y-auto leading-relaxed">
                                <div className="border-l-4 border-[#1976D2] pl-4 mb-2">
                                    <p className="mb-2"><span className="font-semibold">Republic Act No. 10173</span> - The Data Privacy Act of 2012 protects the fundamental human right of privacy, of communication while ensuring free flow of information to promote innovation and growth.</p>
                                    <p className="mb-2">By registering, you consent to the collection, use, and processing of your personal data for legitimate and lawful purposes in accordance with this Act.</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Transparency:</span> You have the right to be informed about how your data is collected and used.</li>
                                        <li><span className="font-semibold">Security:</span> Your data will be protected with appropriate organizational, physical, and technical measures.</li>
                                        <li><span className="font-semibold">Access & Correction:</span> You may access and request correction of your personal data at any time.</li>
                                        <li><span className="font-semibold">Consent:</span> You may withdraw your consent to data processing, subject to legal and contractual restrictions.</li>
                                    </ul>
                                </div>
                                <div className="h-4" />
                                <p className="text-center text-gray-500">For more information, visit the <a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" className="text-[#1976D2] underline">National Privacy Commission</a> website.</p>
                            </div>
                        </div>
                        <style jsx>{`
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            .animate-fadeIn {
                                animation: fadeIn 0.2s ease;
                            }
                            @keyframes scaleIn {
                                from { opacity: 0; transform: scale(0.95); }
                                to { opacity: 1; transform: scale(1); }
                            }
                            .animate-scaleIn {
                                animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
                            }
                            @keyframes slideDown {
                                from { 
                                    opacity: 0;
                                    transform: translateY(-1rem) translateX(-50%);
                                }
                                to { 
                                    opacity: 1;
                                    transform: translateY(0) translateX(-50%);
                                }
                            }
                            .animate-slideDown {
                                animation: slideDown 0.3s ease-out forwards;
                            }
                        `}</style>
                    </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/auth/sign-in" className="text-[#2196F3] font-semibold hover:underline">Sign In</Link>
                </div>
            </div>
            {/* Copyright */}
            <div className="mt-8 text-xs text-gray-400">© 2025 IskoLAR</div>
            <div className="h-8" /> {/* Extra space at the bottom */}
        </div>
    );
}