'use client';

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { UserProfile, userValidation } from "@/lib/types/user";
import { getAuthToken } from "@/lib/useAuth";
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
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
          setFirstName(userData.first_name);
          setLastName(userData.last_name);
        }
      }
    };

    fetchUserData();
  }, []);

  // Add state for each field
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("Besafez");
  const [gender, setGender] = useState("Female");
  const [birthdate, setBirthdate] = useState("04/08/2004");

  // Address states
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [region, setRegion] = useState("");
  
  // Education states
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");

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
        
        // Get auth token using the centralized helper function
        const token = getAuthToken();
        
        // If no token is found, redirect to sign-in
        if (!token) {
          console.log('No authentication token found. Redirecting to sign-in page.');
          redirectToSignIn();
          return;
        }
        
        // Use Supabase Auth directly to get the user
        // This is more reliable than the validate-token endpoint
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.warn('Session validation failed:', authError?.message);
          setError('Your session has expired. Please sign in again.');
          setTimeout(redirectToSignIn, 2000);
          return;
        }
        
        // Fetch profile data from Supabase directly
        // This avoids potential API issues and ensures we get the most up-to-date data
        let { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile from database:', profileError);
          
          // If the profile doesn't exist, we need to create it
          if (profileError.code === 'PGRST116') { // PostgreSQL error for no rows
            console.log('User profile does not exist, creating a new one');
            
            // Create a basic profile for the user
            const newProfile = {
              user_id: user.id,
              email_address: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'active'
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
        const userData: UserProfile = {
          userId: profile.user_id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          middleName: profile.middle_name || '',
          gender: profile.gender || '',
          birthdate: profile.birthdate || '',
          email: profile.email_address,
          mobile: profile.mobile_number || '',
          
          addressLine1: profile.address_line1 || '',
          addressLine2: profile.address_line2 || '',
          barangay: profile.barangay || '',
          city: profile.city || '',
          province: profile.province || '',
          zipCode: profile.zip_code || '',
          region: profile.region || '',
          
          college: profile.college || '',
          course: profile.course || '',
          
          scholarId: profile.scholar_id || '',
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          status: profile.status || '',
        };
        
        // Set the user profile data
        setUserProfile(userData);
        
        // Populate form fields with the fetched data
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setMiddleName(userData.middleName || '');
        setGender(userData.gender || '');
        setEmail(userData.email || '');
        setMobile(userData.mobile || '');
        setScholarId(userData.scholarId || '');
        
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
        setProvince(userData.province || '');
        setZipCode(userData.zipCode || '');
        setRegion(userData.region || '');
        
        // Education fields
        setCollege(userData.college || '');
        setCourse(userData.course || '');
        
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
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // Validate ZIP code
      if (zipCode && !userValidation.validateZipCode(zipCode)) {
        setError('ZIP code must be exactly 4 digits');
        setIsLoading(false);
        return;
      }
      
      // Get the current user session directly from Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If no user or auth error, we can't make a real update
      if (authError || !user) {
        console.warn('Auth error during profile update:', authError?.message);
        setError('Authentication required to update profile. Please sign in.');
        setTimeout(redirectToSignIn, 2000);
        setIsLoading(false);
        return;
      }
      
      // Format the data for database update
      const userUpdateData = {
        // Personal info
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || null,
        gender: gender || null,
        birthdate: userValidation.parseDisplayDate(birthdate) || null,
        mobile_number: mobile,
        
        // Address info
        address_line1: addressLine1 || null,
        address_line2: addressLine2 || null,
        barangay: barangay || null,
        city: city || null,
        province: province || null,
        zip_code: zipCode || null,
        region: region || null,
        
        // Education info
        college: college || null,
        course: course || null,
        
        // Timestamp
        updated_at: new Date().toISOString(),
      };

      // Update user_metadata in auth.users
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          gender: gender,
          birthdate: userValidation.parseDisplayDate(birthdate),
          mobile_number: mobile,
        }
      });

      if (updateAuthError) {
        console.error('Error updating auth user metadata:', updateAuthError);
        throw new Error('Failed to update user metadata');
      }

      // Update in users table
      const { error: updateError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }

      // Get the updated user profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated profile:', fetchError);
        // Still consider the update successful even if we can't fetch the updated profile
        setSuccessMessage('Profile updated successfully');
        setIsEdit(false);
        return;
      }

      // Format the data to match our UserProfile interface and update state
      setUserProfile({
        userId: updatedProfile.user_id,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        middleName: updatedProfile.middle_name || '',
        gender: updatedProfile.gender || '',
        birthdate: updatedProfile.birthdate || '',
        email: updatedProfile.email_address,
        mobile: updatedProfile.mobile_number || '',
        
        addressLine1: updatedProfile.address_line1 || '',
        addressLine2: updatedProfile.address_line2 || '',
        barangay: updatedProfile.barangay || '',
        city: updatedProfile.city || '',
        province: updatedProfile.province || '',
        zipCode: updatedProfile.zip_code || '',
        region: updatedProfile.region || '',
        
        college: updatedProfile.college || '',
        course: updatedProfile.course || '',
        
        scholarId: updatedProfile.scholar_id || '',
        createdAt: updatedProfile.created_at || '',
        updatedAt: updatedProfile.updated_at || '',
        status: updatedProfile.status || '',
      });
      
      // Update was successful
      setSuccessMessage('Profile updated successfully');
      setIsEdit(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Add state for each document file
  const [, setPsaFile] = useState<File | null>(null);
  const [psaFileName, setPsaFileName] = useState("psabirthcert.pdf");
  const [, setVoterFile] = useState<File | null>(null);
  const [voterFileName, setVoterFileName] = useState("votercert.pdf");
  const [, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdFileName, setNationalIdFileName] = useState("nationalid.pdf");

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
            <span className="absolute top-1 left-7">
              <span className="block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-[notification-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
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
              {firstName} {lastName}
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
          {isEdit ? (
            <>
              <button
                className={`cursor-pointer mt-6 mb-2 bg-[#219174] hover:bg-[#17695a] text-white px-5 py-2 rounded-lg font-medium shadow transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleUpdateProfile}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="cursor-pointer bg-[#f44336] text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-[#c62828] transition"
                onClick={() => {
                  setIsEdit(false);
                  setError('');
                  // Reset form to current profile data
                  if (userProfile) {
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
                    setProvince(userProfile.province || '');
                    setZipCode(userProfile.zipCode || '');
                    setRegion(userProfile.region || '');
                    
                    // Education fields
                    setCollege(userProfile.college || '');
                    setCourse(userProfile.course || '');
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
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Scholar ID</label>
                <input
                  className="w-full bg-gray-100 rounded px-3 py-2 text-sm"
                  value={scholarId || "Not assigned yet"}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={email}
                  readOnly={!isEdit}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <input
                  className="w-full bg-gray-100 rounded px-3 py-2 text-sm"
                  value="••••••••••••••••"
                  readOnly
                />
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
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={gender}
                  readOnly={!isEdit}
                  onChange={e => setGender(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={birthdate}
                  readOnly={!isEdit}
                  onChange={e => setBirthdate(e.target.value)}
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
                />
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
            <div className="grid grid-cols-4 gap-4 mb-3">
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
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={city}
                  disabled={!isEdit}
                  onChange={e => {
                    setCity(e.target.value);
                    const region = getRegionByProvince(province);
                    setRegion(region);
                  }}
                >
                  {getCitiesByProvince(province).map(cityOption => (
                    <option key={cityOption} value={cityOption}>{cityOption}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Province</label>
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={province}
                  disabled={!isEdit}
                  onChange={e => {
                    setProvince(e.target.value);
                    const cities = getCitiesByProvince(e.target.value);
                    if (cities.length > 0) {
                      setCity(cities[0]);
                    }
                    const region = getRegionByProvince(e.target.value);
                    setRegion(region);
                  }}
                >
                  {Object.keys(provincesData).map(provinceOption => (
                    <option key={provinceOption} value={provinceOption}>{provinceOption}</option>
                  ))}
                </select>
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Region <span className="text-gray-400">(auto-derived)</span></label>
                <input
                  className="w-full bg-gray-100 rounded px-3 py-2 text-sm"
                  value={region}
                  readOnly
                />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">College/University</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value="Asia Pacific College"
                  readOnly={!isEdit}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <input
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value="Bachelor of Science in Computer Science"
                  readOnly={!isEdit}
                />
              </div>
            </div>
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
              {/* Certificate of Registration */}
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
                      <span className="text-xs text-gray-500 truncate">{psaFileName}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{psaFileName}</span>
                  )}
                </div>
              </div>
              {/* Certificate of Grades */}
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
                      <span className="text-xs text-gray-500 truncate">{voterFileName}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{voterFileName}</span>
                  )}
                </div>
              </div>
              {/* School ID */}
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
                      <span className="text-xs text-gray-500 truncate">{nationalIdFileName}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700 truncate">{nationalIdFileName}</span>
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