'use client';

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { userValidation } from "@/lib/types/user";
import { getAuthToken } from "@/lib/useAuth";
import { supabase } from '@/lib/supabaseClient';

// Interface for the frontend (camelCase)
interface ExtendedUserProfile {
  scholarId: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  gender: string;
  birthdate: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  barangay: string;
  city: string;
  zipCode: string;
  college: string;
  course: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

// Helper function to map database response to frontend model
interface DatabaseProfile {
  user_id: string;
  email_address: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  gender: string;
  birthdate: string;
  mobile_number: string;
  address_line1: string;
  address_line2?: string;
  barangay: string;
  city: string;
  zip_code: string;
  created_at: string;
  updated_at?: string;
  college_university: string;
  college_course: string;
  last_login?: string;
}

function mapDatabaseToProfile(dbProfile: DatabaseProfile): ExtendedUserProfile {
  return {
    scholarId: "", // This is a placeholder as it's not in the DB
    userId: dbProfile.user_id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    middleName: dbProfile.middle_name,
    email: dbProfile.email_address,
    gender: dbProfile.gender,
    birthdate: dbProfile.birthdate,
    mobile: dbProfile.mobile_number,
    addressLine1: dbProfile.address_line1,
    addressLine2: dbProfile.address_line2,
    barangay: dbProfile.barangay,
    city: dbProfile.city,
    zipCode: dbProfile.zip_code,
    college: dbProfile.college_university,
    course: dbProfile.college_course,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    lastLogin: dbProfile.last_login
  };
}

export default function ProfilePage() {
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  
  // Add state for each field
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // Basic user data fetch (name only)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Starting initial user data fetch...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error in initial fetch:', authError);
          return;
        }

        console.log('Auth user in initial fetch:', user);
        
        if (user && user.email) {
          console.log('Fetching user data with email:', user.email);
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email_address', user.email)
            .single();
          
          console.log('Initial user data fetch result:', userData);
          console.log('Initial user data fetch error:', dbError);
          
          if (userData) {
            console.log('Setting initial user data...');
            setFirstName(userData.first_name || '');
            setLastName(userData.last_name || '');
            setCollege(userData.college_university || '');
            setCourse(userData.college_course || '');
          }
        }
      } catch (error) {
        console.error('Error in initial user data fetch:', error);
      }
    };

    fetchUserData();
  }, []);

  // Address states
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // Education states
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");



  // Validation functions - use shared validation from our model
  const getZipCodeValidationMessage = (zipCode: string) => {
    if (!zipCode) return "";
    if (!userValidation.validateZipCode(zipCode)) {
      return "ZIP code must be exactly 4 digits";
    }
    return "";
  };
  
  // Note: We now use the centralized getAuthToken function from useAuth.ts
  
  // This function will redirect the user to the sign-in page if they are not authenticated
  const redirectToSignIn = () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.location.href = `/auth/sign-in?redirectTo=${encodeURIComponent(currentPath)}`;
    }
  };
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage(''); // Clear any previous messages
      setError(''); // Clear any previous errors
        
        console.log('Starting main profile fetch...');
        
        // Get auth token using the centralized helper function
        const token = getAuthToken();
        console.log('Auth token exists:', !!token);
        
        // If no token is found, redirect to sign-in
        if (!token) {
          console.log('No authentication token found. Redirecting to sign-in page.');
          redirectToSignIn();
          return;
        }
        
        // Use Supabase Auth directly to get the user
        console.log('Fetching auth user...');
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const user = authData?.user;
        
        console.log('Auth User:', user);
        console.log('Auth Error:', authError);
        
        if (authError || !user) {
          console.warn('Session validation failed:', authError?.message);
          setError('Your session has expired. Please sign in again.');
          setTimeout(redirectToSignIn, 2000);
          return;
        }
        
        console.log('Auth successful, user email:', user.email);
        
        // First try to fetch by email since we know it's unique
        console.log('Attempting to fetch profile by email:', user.email);
        let { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email_address', user.email)
          .single();
          
        console.log('Email fetch result:', { profile, error: profileError });
          
        // If that fails, try by user_id as fallback
        if (!profile) {
          console.log('Email fetch failed, trying user_id:', user.id);
          ({ data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single());
            
          console.log('User ID fetch result:', { profile, error: profileError });
        }
          
        console.log('Profile Data:', profile);
        console.log('Profile Error:', profileError);
          
        if (profileError) {
          console.error('Error fetching profile from database:', profileError);
          
          // If the profile doesn't exist, we need to create it
          if (profileError.code === 'PGRST116') { // PostgreSQL error for no rows
            console.log('User profile does not exist, creating a new one');
            
            // Create a basic profile for the user with required fields
            const newProfile = {
              user_id: user.id,
              email_address: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              gender: '',
              birthdate: new Date().toISOString(),
              mobile_number: '',
              address_line1: '',
              barangay: '',
              city: '',
              zip_code: '',
              college_university: '',
              college_course: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Insert the new profile
            const { data: createdProfile, error: createError } = await supabase
              .from('users')
              .insert([newProfile])
              .select()
              .single();
              
            if (createError) {
              console.error('Failed to create user profile:', createError);
              setError('Failed to create your profile. Please contact support.');
              return;
            }
            
            // Use the newly created profile
            profile = createdProfile;
          } else {
            setError('Failed to fetch your profile. Please try again later.');
            return;
          }
        }
        
        if (!profile) {
          setError('Profile not found. Please contact support.');
          return;
        }
        
        // Format the profile data to match our UserProfile interface
        const userData = mapDatabaseToProfile(profile);
        
        // Set the user profile data
        setUserProfile(userData);
        
        // Populate form fields with the fetched data
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setMiddleName(userData.middleName || '');
        setGender(userData.gender || '');
        setEmail(userData.email || '');
        setMobile(userData.mobile || '');
        
        // Format date from ISO to MM/DD/YYYY for display
        if (userData.birthdate) {
          const displayDate = userValidation.formatDateForDisplay(userData.birthdate);
          setBirthdate(displayDate);
        }
        
        // Address fields
        setAddressLine1(userData.addressLine1 || '');
        setAddressLine2(userData.addressLine2 || '');
        setBarangay(userData.barangay || '');
        setCity(userData.city || '');
        setZipCode(userData.zipCode || '');
        
        // Education fields
        setCollege(userData.college || '');
        setCourse(userData.course || '');
        // Year level and GPA fields removed as they are not in the current schema
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    // Prevent duplicate submissions
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // Get auth token using the centralized helper function
      const token = getAuthToken();
      
      // If no token is found, redirect to sign-in
      if (!token) {
        console.log('No authentication token found. Redirecting to sign-in page.');
        redirectToSignIn();
        return;
      }
      
      // Prepare the profile data for API call
      // Convert frontend model to database format
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        gender,
        birthdate: userValidation.parseDisplayDate(birthdate),
        email_address: email,
        mobile_number: mobile,
        address_line1: addressLine1,
        address_line2: addressLine2,
        barangay,
        city,
        zip_code: zipCode,
        college_university: college,
        college_course: course,
      };

      // Update profile directly in Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(profileData)
        .eq('user_id', userProfile?.userId)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }

      const result = { profile: mapDatabaseToProfile(updatedProfile), message: 'Profile updated successfully' };

      // Update the user profile state with the response data
      if (result.profile) {
        setUserProfile(result.profile);
        
        // Update form fields with the updated data
        setFirstName(result.profile.firstName);
        setLastName(result.profile.lastName);
        setMiddleName(result.profile.middleName || '');
        setGender(result.profile.gender || '');
        setEmail(result.profile.email || '');
        setMobile(result.profile.mobile || '');
        setBirthdate(result.profile.birthdate 
          ? userValidation.formatDateForDisplay(result.profile.birthdate) 
          : '');
        
        // Address fields
        setAddressLine1(result.profile.addressLine1 || '');
        setAddressLine2(result.profile.addressLine2 || '');
        setBarangay(result.profile.barangay || '');
        setCity(result.profile.city || '');
        setZipCode(result.profile.zipCode || '');
        
        // Education fields
        setCollege(result.profile.college || '');
        setCourse(result.profile.course || '');
      }
      
      // Update was successful
      setSuccessMessage(result.message || 'Profile updated successfully');
      setIsEdit(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      // Add a small delay before removing loading state to ensure UI feedback
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      setIsLoading(false);
    }
  };

  // Add state for each document file
  const [, setPsaFile] = useState<File | null>(null);
  const [psaFileName, setPsaFileName] = useState("");
  const [, setVoterFile] = useState<File | null>(null);
  const [voterFileName, setVoterFileName] = useState("");
  const [, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdFileName, setNationalIdFileName] = useState("");

  // Refs for each card section
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

      {/* Main content area */}
      <div className="pt-8 flex max-w-7xl mx-auto gap-8 px-8 items-start">
        {/* Left Column */}
        <div className="w-1/5 min-w-[220px] flex flex-col items-stretch">
          <div className="bg-white rounded-xl shadow p-6 sticky top-4 flex flex-col h-fit">
            <div className="font-semibold text-gray-700 mb-1 text-lg">Manage Profile</div>
            <div className="text-sm text-gray-400 mb-4">You can manage your profile here.</div>
            <nav className="flex flex-col gap-2">

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
                <Image src="/icons/program.svg" alt="Program" width={20} height={20} />
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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {isEdit ? (
            <>
              <button
                className={`cursor-pointer mt-6 mb-2 ${isLoading ? 'bg-gray-400' : 'bg-[#219174] hover:bg-[#17695a]'} text-white px-5 py-2 rounded-lg font-medium shadow transition`}
                onClick={isLoading ? undefined : handleUpdateProfile}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </button>
              <button
                className={`cursor-pointer bg-[#f44336] text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-[#c62828] transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!isLoading && userProfile) {
                    // Reset form to current profile data
                    setFirstName(userProfile.firstName);
                    setLastName(userProfile.lastName);
                    setMiddleName(userProfile.middleName || '');
                    setGender(userProfile.gender || '');
                    setEmail(userProfile.email || '');
                    setMobile(userProfile.mobile || '');
                    setBirthdate(userProfile.birthdate 
                      ? userValidation.formatDateForDisplay(userProfile.birthdate) 
                      : '');
                    
                    // Address fields
                    setAddressLine1(userProfile.addressLine1 || '');
                    setAddressLine2(userProfile.addressLine2 || '');
                    setBarangay(userProfile.barangay || '');
                    setCity(userProfile.city || '');
                    setZipCode(userProfile.zipCode || '');
                    
                    // Education fields
                    setCollege(userProfile.college || '');
                    setCourse(userProfile.course || '');
                    // Year level and GPA fields removed as they are not in the current schema
                  }
                }}
                disabled={isLoading}
                type="button"
              >
                Cancel
              </button>
              
              {/* Error/Success messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border-green-100 text-green-600 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="cursor-pointer mt-6 bg-[#2196f3] hover:bg-[#1976d2] text-white px-5 py-2 rounded-lg font-medium shadow transition"
                onClick={() => {
                  setIsEdit(true);
                  setError('');
                  setSuccessMessage('');
                }}
                type="button"
              >
                Edit Profile
              </button>
              
              {/* Only show success message in view mode */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border-green-100 text-green-600 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
            </>
          )}
        </div>
        {/* Right Column */}
        <div
          className="w-4/5 flex flex-col gap-4 max-h-[calc(100vh-32px)] overflow-y-auto pr-2 pb-8"
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

          {/* Personal Section */}
          <div ref={personalRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/personal.svg" alt="Personal" width={19} height={19} />
              <span className="font-semibold text-gray-700 text-lg">Personal</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={lastName}
                  readOnly={!isEdit}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={firstName}
                  readOnly={!isEdit}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={middleName}
                  readOnly={!isEdit}
                  onChange={e => setMiddleName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gender</label>
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={gender}
                  disabled={!isEdit}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={birthdate}
                  readOnly={!isEdit}
                  onChange={e => setBirthdate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>
          </div>
          {/* Contact Section */}
          <div ref={contactRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/contact.svg" alt="Contact" width={18.5} height={18.5} />
              <span className="font-semibold text-gray-700 text-lg">Contact</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={email}
                  readOnly={!isEdit}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={mobile}
                  readOnly={!isEdit}
                  onChange={e => setMobile(e.target.value)}
                  placeholder={isEdit ? "e.g., 09171234567 or +639171234567" : ""}
                />
                {isEdit && mobile && !userValidation.validateContactNumber(mobile).isValid && (
                  <p className="text-xs text-red-500 mt-1">
                    {userValidation.validateContactNumber(mobile).error || 'Invalid mobile number'}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Address Section */}
          <div ref={addressRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/address.svg" alt="Address" width={22} height={22} />
              <span className="font-semibold text-gray-700 text-lg">Address</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address Line 1 (House/Unit/Building + Street)</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={addressLine1}
                  readOnly={!isEdit}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="123 Main Street, Unit 4A"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address Line 2 (Subdivision/Village/Purok/Sitio) <span className="text-gray-400">(optional)</span></label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={addressLine2}
                  readOnly={!isEdit}
                  onChange={e => setAddressLine2(e.target.value)}
                  placeholder="Sample Subdivision"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Barangay</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={barangay}
                  readOnly={!isEdit}
                  onChange={e => setBarangay(e.target.value)}
                  placeholder="Sample Barangay"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City/Municipality</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={city}
                  readOnly={!isEdit}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City/Municipality"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ZIP Code</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={zipCode}
                  readOnly={!isEdit}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setZipCode(value);
                  }}
                  placeholder="1234"
                  maxLength={4}
                />
                {isEdit && getZipCodeValidationMessage(zipCode) && (
                  <p className="text-xs text-red-500 mt-1">{getZipCodeValidationMessage(zipCode)}</p>
                )}
              </div>
            </div>
          </div>
          {/* Program Section */}
          <div ref={programRef} className="bg-white rounded-xl shadow p-6 mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/program.svg" alt="Program" width={20} height={20} />
              <span className="font-semibold text-gray-700 text-lg">Program</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">College/University</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={college}
                  readOnly={!isEdit}
                  onChange={e => setCollege(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={course}
                  readOnly={!isEdit}
                  onChange={e => setCourse(e.target.value)}
                />
              </div>
            </div>
            {/* Temporarily commented out until database migration is run */}
            {/* 
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year Level</label>
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={yearLevel}
                  disabled={!isEdit}
                  onChange={e => setYearLevel(e.target.value)}
                >
                  <option value="">Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">GPA</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={gpa}
                  readOnly={!isEdit}
                  onChange={e => setGpa(e.target.value)}
                  placeholder="e.g., 3.50"
                />
              </div>
            </div>
            */}
          </div>
          {/* Documents Section */}
          <div ref={documentsRef} className="bg-white rounded-xl shadow p-6 mb-2">
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
              {/* PSA Birth Certificate */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">PSA Birth Certificate</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  {isEdit ? (
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setPsaFile(e.target.files[0]);
                            setPsaFileName(e.target.files[0].name);
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500 truncate">{psaFileName || "No document uploaded"}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{psaFileName || "No document uploaded"}</span>
                  )}
                </div>
              </div>
              {/* Voter's Certification */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Voter&apos;s Certification</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  {isEdit ? (
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setVoterFile(e.target.files[0]);
                            setVoterFileName(e.target.files[0].name);
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500 truncate">{voterFileName || "No document uploaded"}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{voterFileName || "No document uploaded"}</span>
                  )}
                </div>
              </div>
              {/* National ID */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">National ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  {isEdit ? (
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setNationalIdFile(e.target.files[0]);
                            setNationalIdFileName(e.target.files[0].name);
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500 truncate">{nationalIdFileName || "No document uploaded"}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{nationalIdFileName || "No document uploaded"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


