'use client';

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import BrandedLoader from "@/app/components/ui/BrandedLoader";
import { userValidation } from "@/lib/types/user";
import { getAuthToken } from "@/lib/useAuth";
import { supabase } from '@/lib/supabaseClient';
import TransactionHistory from '@/app/components/scholar/TransactionHistory';

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<{url: string; name: string; type: string} | null>(null);
  
  // Add state for each field
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  
  // Address states
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [barangay, setBarangay] = useState("");
  const [, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // Education states
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");

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
        
        // Format birthdate for input type="date"
        if (userData.birthdate) {
          setBirthdate(userData.birthdate.split('T')[0]);
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
    if (isLoading) {
      console.log('Update already in progress, returning...');
      return;
    }
    
    try {
      console.log('Starting profile update...');
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // Get auth token using the centralized helper function
      const token = getAuthToken();
      console.log('Auth token check:', !!token);
      
      if (!token) {
        console.log('No authentication token found. Redirecting to sign-in page.');
        setIsLoading(false);
        redirectToSignIn();
        return;
      }

      if (!userProfile?.userId) {
        console.error('No user ID found');
        setIsLoading(false);
        setError('User ID not found');
        return;
      }
      
      // Validate required fields
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        console.error('Required fields missing');
        setIsLoading(false);
        setError('First name, last name, and email are required');
        return;
      }

      // Always set city to "Makati City"
      const fixedCity = "Makati City";
      
      // Find ZIP code based on barangay
      const selectedBarangay = BARANGAYS.find(b => b.name === barangay);
      const zipCodeToUse = selectedBarangay ? selectedBarangay.zipCode : zipCode;

      // Use the birthdate directly from the date input
      // It's already in YYYY-MM-DD format
      const formattedBirthdate = birthdate;
      
      // Prepare the profile data for API call
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || null,
        gender: gender.trim(),
        birthdate: formattedBirthdate,
        email_address: email.trim(),
        mobile_number: mobile.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || null,
        barangay: barangay.trim(),
        city: fixedCity,
        zip_code: zipCodeToUse,
        college_university: college.trim(),
        college_course: course.trim(),
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with data:', profileData);

      // Update profile in Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(profileData)
        .eq('user_id', userProfile.userId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError(updateError.message || 'Failed to update profile');
        setIsLoading(false);
        return;
      }
      
      if (!updatedProfile) {
        console.error('No profile data returned after update');
        setError('Failed to update profile - no data returned');
        setIsLoading(false);
        return;
      }

      console.log('Profile updated successfully:', updatedProfile);

      // Map the updated profile data
      console.log('Profile updated successfully:', updatedProfile);

      try {
        // Map the database response to our frontend model
        const updatedProfileData = mapDatabaseToProfile(updatedProfile);
        console.log('Mapped profile data:', updatedProfileData);

        // Update states in sequence
        setUserProfile(updatedProfileData);
        setFirstName(updatedProfileData.firstName);
        setLastName(updatedProfileData.lastName);
        setMiddleName(updatedProfileData.middleName || '');
        setGender(updatedProfileData.gender || '');
        setEmail(updatedProfileData.email || '');
        setMobile(updatedProfileData.mobile || '');
        setBirthdate(updatedProfileData.birthdate || '');
        setAddressLine1(updatedProfileData.addressLine1 || '');
        setAddressLine2(updatedProfileData.addressLine2 || '');
        setBarangay(updatedProfileData.barangay || '');
        setZipCode(updatedProfileData.zipCode || '');
        setCollege(updatedProfileData.college || '');
        setCourse(updatedProfileData.course || '');

        // Show success message and exit edit mode
        console.log('Update successful, showing success message');
        setSuccessMessage('Profile updated successfully!');
        setIsEdit(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating local state:', error);
        setError('An error occurred while updating the display');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false); // Clear loading state before showing error
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  // Data arrays for select inputs
  const BARANGAYS = [
    { name: "Ayala-Paseo de Roxas", zipCode: "1226" },
    { name: "Bangkal", zipCode: "1233" },
    { name: "Bel-Air", zipCode: "1209" },
    { name: "Cembo", zipCode: "1214" },
    { name: "Comembo", zipCode: "1217" },
    { name: "Dasmariñas Village North", zipCode: "1221" },
    { name: "Dasmariñas Village South", zipCode: "1222" },
    { name: "Forbes Park North", zipCode: "1219" },
    { name: "Forbes Park South", zipCode: "1220" },
    { name: "Fort Bonifacio Naval Station", zipCode: "1202" },
    { name: "Fort Bonifacio (Camp)", zipCode: "1201" },
    { name: "Greenbelt", zipCode: "1228" },
    { name: "Guadalupe Nuevo", zipCode: "1212" },
    { name: "Guadalupe Viejo", zipCode: "1211" },
    { name: "Kasilawan", zipCode: "1206" },
    { name: "La Paz–Singkamas–Tejeros", zipCode: "1204" },
    { name: "Legaspi Village", zipCode: "1229" },
    { name: "Magallanes Village", zipCode: "1232" },
    { name: "Makati Commercial Center", zipCode: "1224" },
    { name: "Makati CPO + Buendia Ave", zipCode: "1200" },
    { name: "Olympia & Carmona", zipCode: "1207" },
    { name: "Palanan", zipCode: "1235" },
    { name: "Pasong Tamo & Ecology Village", zipCode: "1231" },
    { name: "Pembo", zipCode: "1218" },
    { name: "Pinagkaisahan–Pitogo", zipCode: "1213" },
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

  const COLLEGES = [
    "Adamson University",
    "AMA Computer University",
    "Arellano University",
    "Asian Institute of Journalism and Communication",
    "Asian Institute of Management",
    "Asian Institute of Maritime Studies",
    "Asian Social Institute",
    "Asia Pacific College",
    "Assumption College San Lorenzo",
    "Central Colleges of the Philippines",
    "Centro Escolar University",
    "Chiang Kai Shek College",
    "Colegio de San Juan de Letran",
    "College of the Holy Spirit",
    "De La Salle-College of Saint Benilde",
    "De La Salle University",
    "Don Bosco Technical College",
    "Emilio Aguinaldo College",
    "Eulogio \"Amang\" Rodriguez Institute of Science and Technology",
    "Far Eastern University",
    "FEATI University",
    "FEU Institute of Technology",
    "José Rizal University",
    "La Consolacion College Manila",
    "Lyceum of the Philippines University",
    "Manila Central University",
    "Manuel L. Quezon University",
    "Mapúa University",
    "Miriam College",
    "National College of Business and Arts",
    "National Defense College of the Philippines",
    "National Teachers College",
    "National University, Philippines",
    "New Era University",
    "Olivarez College",
    "Our Lady of Fatima University",
    "Pamantasan ng Lungsod ng Maynila",
    "PATTS College of Aeronautics",
    "Pasig Catholic College",
    "Philippine Christian University",
    "Philippine Normal University",
    "Philippine School of Business Administration",
    "Polytechnic University of the Philippines",
    "Rizal Technological University",
    "Saint Jude College",
    "Saint Pedro Poveda College",
    "San Beda University",
    "Santa Isabel College",
    "St. Joseph's College of Quezon City",
    "St. Luke's College of Medicine - WHQM",
    "St. Mary's College",
    "St. Paul University Manila",
    "St. Paul University Quezon City",
    "St. Scholastica's College",
    "St. Louis College Valenzuela",
    "Technological Institute of the Philippines",
    "Technological University of the Philippines",
    "The Philippine Women's University",
    "The University of Manila",
    "Trinity University of Asia",
    "University of Asia and the Pacific",
    "University of Perpetual Help System DALTA",
    "University of Santo Tomas",
    "University of the East",
    "University of the East Ramon Magsaysay",
    "University of the Philippines Diliman",
    "University of the Philippines Manila",
    "University of the Philippines System"
  ];

  const COURSES = [
    "BA Communication",
    "BA English",
    "BA History",
    "BA Literature",
    "BA Philosophy",
    "BA Political Science",
    "BA Psychology",
    "BA Sociology",
    "BCA (Bachelor of Customs Administration)",
    "BEEd (Bachelor of Elementary Education)",
    "BFA Fine Arts",
    "BHRM (Bachelor of Hospitality and Restaurant Management)",
    "BPEd (Bachelor of Physical Education)",
    "BSEd (Bachelor of Secondary Education)",
    "BS Accountancy",
    "BS Accounting Information System",
    "BS Aeronautical Engineering",
    "BS Agriculture",
    "BS Applied Mathematics",
    "BS Architecture",
    "BS Biology",
    "BS Biotechnology",
    "BS Business Administration",
    "BS Chemical Engineering",
    "BS Chemistry",
    "BS Civil Engineering",
    "BS Communication",
    "BS Community Development",
    "BS Computer Engineering",
    "BS Computer Science",
    "BS Criminology",
    "BS Customs Administration",
    "BS Dentistry",
    "BS Economics",
    "BS Education (Elementary / Secondary / Special Education)",
    "BS Electrical Engineering",
    "BS Electronics Engineering",
    "BS Entrepreneurship",
    "BS Environmental Science",
    "BS Finance",
    "BS Fine Arts",
    "BS Forestry",
    "BS Geology",
    "BS Hospitality Management",
    "BS Human Resource Management",
    "BS Industrial Engineering",
    "BS Information Systems",
    "BS Information Technology",
    "BS Interior Design",
    "BS International Relations",
    "BS International Studies",
    "BS Journalism",
    "BS Legal Management",
    "BS Management Accounting",
    "BS Marine Engineering",
    "BS Marine Transportation",
    "BS Mathematics",
    "BS Mechanical Engineering",
    "BS Medical Technology",
    "BS Midwifery",
    "BS Nursing",
    "BS Nutrition and Dietetics",
    "BS Occupational Therapy",
    "BS Pharmacy",
    "BS Physical Therapy",
    "BS Physics",
    "BS Political Science",
    "BS Psychology",
    "BS Public Administration",
    "BS Radiologic Technology",
    "BS Real Estate Management",
    "BS Social Work",
    "BS Sociology",
    "BS Statistics",
    "BS Tourism Management"
  ];

  // Document states with enhanced tracking
  interface DocumentState {
    file: File | null;
    fileName: string;
    uploadProgress: number;
    isUploading: boolean;
    documentId: string | null;
    error: string | null;
  }

  const [documents, setDocuments] = useState<Record<string, DocumentState>>({
    psa: { file: null, fileName: "", uploadProgress: 0, isUploading: false, documentId: null, error: null },
    studentVoter: { file: null, fileName: "", uploadProgress: 0, isUploading: false, documentId: null, error: null },
    guardianVoter: { file: null, fileName: "", uploadProgress: 0, isUploading: false, documentId: null, error: null },
    barangayId: { file: null, fileName: "", uploadProgress: 0, isUploading: false, documentId: null, error: null },
    validId: { file: null, fileName: "", uploadProgress: 0, isUploading: false, documentId: null, error: null }
  });

  // Function to update document state
  const updateDocumentState = useCallback((type: string, updates: Partial<DocumentState>) => {
    setDocuments(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates }
    }));
  }, []);

  // Function to handle document upload
  const handleDocumentUpload = async (type: string, file: File) => {
    try {
      // Reset state and start upload
      updateDocumentState(type, { 
        file, 
        fileName: file.name, 
        isUploading: true, 
        error: null,
        uploadProgress: 0
      });

      // Check if we have a valid user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to upload documents');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const uploadedFileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (!uploadedFileExt || (!allowedExtensions.includes(uploadedFileExt) && !allowedTypes.includes(file.type))) {
        throw new Error('File must be PDF, JPG, JPEG, or PNG format');
      }

      // Upload file to Supabase storage with folder structure
      const filePath = `${user.id}/${type}/${Date.now()}_${file.name}`;
      
      // Create upload options with progress tracking
      const options = {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          const percentage = Math.round((progress.loaded * 100) / progress.total);
          updateDocumentState(type, { uploadProgress: percentage });
        },
      };

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, options);

      if (uploadError) throw new Error(uploadError.message);

      // Map UI document types to database enum values
      const documentTypeMap: Record<string, string> = {
        'psa': 'PSA Birth Certificate',
        'studentVoter': "Student's Voter's Certification",
        'guardianVoter': "Guardian's Voter's Certification",
        'barangayId': 'Barangay ID',
        'validId': 'Valid ID or School ID'
      };

      // Save document metadata to database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([{
          document_type: documentTypeMap[type],
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          user_id: user.id,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (docError) throw new Error(docError.message);

      // Update document state with success
      updateDocumentState(type, {
        documentId: docData.documents_id,
        isUploading: false,
        uploadProgress: 100,
        fileName: file.name,
        error: null
      });

      setSuccessMessage(`Document uploaded successfully!`);
      
      // Refresh the documents list
      await fetchDocuments();
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      updateDocumentState(type, {
        error: error instanceof Error ? error.message : 'Upload failed',
        isUploading: false,
        uploadProgress: 0
      });
    }
  };

  // Function to fetch existing documents
  const fetchDocuments = useCallback(async () => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Update state for each document type
      if (data) {
        // Reverse mapping from database enum values to UI keys
        const reverseDocumentTypeMap: Record<string, string> = {
          'PSA Birth Certificate': 'psa',
          "Student's Voter's Certification": 'studentVoter',
          "Guardian's Voter's Certification": 'guardianVoter',
          'Barangay ID': 'barangayId',
          'Valid ID or School ID': 'validId'
        };

        data.forEach(doc => {
          const uiType = reverseDocumentTypeMap[doc.document_type];
          if (uiType && uiType in documents) {
            updateDocumentState(uiType, {
              fileName: doc.file_name,
              documentId: doc.documents_id,
              uploadProgress: 100
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, [documents, updateDocumentState]);

  // Fetch documents when profile loads
  useEffect(() => {
    if (userProfile?.userId) {
      void fetchDocuments();
    }
  }, [userProfile?.userId, fetchDocuments]);

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

  // Full-page loading screen for initial profile load
  if (isLoading && !userProfile) {
    return <BrandedLoader title="Loading Profile" subtitle="Retrieving your information..." />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f6fa] pl-64">
      {/* Floating Success Message */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 z-50 animate-slideDown">
          <div className="transform -translate-x-1/2">
            <div className="mx-4 inline-block min-w-[280px] max-w-[90vw]">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 shadow-lg transition-all duration-200">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 whitespace-normal wrap-break-word">{successMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
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
                      ? userProfile.birthdate.split('T')[0]
                      : '');
                    
                    // Address fields
                    setAddressLine1(userProfile.addressLine1 || '');
                    setAddressLine2(userProfile.addressLine2 || '');
                    setBarangay(userProfile.barangay || '');
                    // City is always "Makati City"
                    // ZIP code is set automatically based on barangay
                    const selectedBarangay = BARANGAYS.find(b => b.name === userProfile.barangay);
                    setZipCode(selectedBarangay ? selectedBarangay.zipCode : '');
                    
                    // Education fields
                    setCollege(userProfile.college || '');
                    setCourse(userProfile.course || '');
                    
                    // Exit edit mode
                    setIsEdit(false);
                    setError('');
                    setSuccessMessage('');
                  }
                }}
                disabled={isLoading}
                type="button"
              >
                Cancel
              </button>
              
              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
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
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Birthdate</label>
                <input
                  type="date"
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={birthdate}
                  readOnly={!isEdit}
                  onChange={e => setBirthdate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Prevents future dates
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
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={barangay}
                  disabled={!isEdit}
                  onChange={e => {
                    setBarangay(e.target.value);
                    const selected = BARANGAYS.find(b => b.name === e.target.value);
                    if (selected) {
                      setZipCode(selected.zipCode);
                    }
                  }}
                >
                  <option value="">Select Barangay</option>
                  {BARANGAYS.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City/Municipality</label>
                <input
                  className="w-full bg-gray-100 rounded px-3 py-2 text-sm"
                  value="Makati City"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ZIP Code</label>
                <input
                  className="w-full bg-gray-100 rounded px-3 py-2 text-sm"
                  value={zipCode}
                  readOnly
                  placeholder="Will be set based on barangay"
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">College/University</label>
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={college}
                  disabled={!isEdit}
                  onChange={e => setCollege(e.target.value)}
                >
                  <option value="">Select College/University</option>
                  {COLLEGES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <select
                  className={`w-full ${isEdit ? "bg-white border border-gray-300" : "bg-gray-100"} rounded px-3 py-2 text-sm`}
                  value={course}
                  disabled={!isEdit}
                  onChange={e => setCourse(e.target.value)}
                >
                  <option value="">Select Course</option>
                  {COURSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
              <span className="font-semibold text-gray-700 text-lg">Documents</span>
            </div>
            <hr className="border-gray-200 mb-4" />
            
            {/* Document Upload Guidelines */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Document Upload Guidelines
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Max file size: <strong>10MB</strong>. Allowed formats:{" "}
                    <strong>PDF, PNG, JPG, JPEG</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {Object.entries(documents).map(([type, doc]) => {
                const title = type === 'psa' ? 'PSA Birth Certificate' :
                            type === 'studentVoter' ? "Student's Voter's Certification" :
                            type === 'guardianVoter' ? "Guardian's Voter's Certification" :
                            type === 'barangayId' ? "Barangay ID" :
                            "Valid ID or School ID";
                
                return (
                  <div key={type}>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">{title}</label>
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                      {isEdit ? (
                        <>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handleDocumentUpload(type, e.target.files[0]);
                              }
                            }}
                          />
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                {doc.fileName || "No document uploaded"}
                              </span>
                              {doc.isUploading && (
                                <span className="text-xs text-blue-500 ml-2">
                                  {doc.uploadProgress}%
                                </span>
                              )}
                            </div>
                            {doc.isUploading && (
                              <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${doc.uploadProgress}%` }}
                                >
                                  <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"/>
                                </div>
                              </div>
                            )}
                            {doc.error && (
                              <div className="flex items-center mt-1">
                                <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-red-500">{doc.error}</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-gray-700 truncate">
                            {doc.fileName || "No document uploaded"}
                          </span>
                          {doc.documentId && (
                            <button
                              type="button"
                              className="cursor-pointer text-[#2196F3] hover:text-[#1976D2] text-xs font-medium"
                              onClick={async () => {
                                try {
                                  // Get the document details from the database first
                                  const { data: docData, error: docError } = await supabase
                                    .from('documents')
                                    .select('file_path')
                                    .eq('documents_id', doc.documentId)
                                    .single();

                                  if (docError) throw new Error('Could not find document details');
                                  if (!docData?.file_path) throw new Error('Document path not found');

                                  // Create a signed URL with the correct file path
                                  const { data: urlData } = await supabase
                                    .storage
                                    .from('documents')
                                    .createSignedUrl(docData.file_path, 3600); // 1 hour expiry
                                  
                                  if (urlData?.signedUrl) {
                                    // Determine file type from extension
                                    const fileExt = doc.fileName.split('.').pop()?.toLowerCase();
                                    const type = fileExt === 'pdf' ? 'pdf' : 'image';

                                    // Open document in modal
                                    setViewerDocument({
                                      url: urlData.signedUrl,
                                      name: doc.fileName,
                                      type: type
                                    });
                                    setViewerOpen(true);
                                  } else {
                                    throw new Error('Could not generate document URL');
                                  }
                                } catch (error) {
                                  console.error('Error getting download URL:', error);
                                  setError('Failed to view document');
                                }
                              }}
                            >
                              View Document
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction History Section */}
          <TransactionHistory />
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && viewerDocument && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setViewerOpen(false);
              setViewerDocument(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {viewerDocument.type === 'pdf' ? (
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{viewerDocument.name}</h3>
                    <p className="text-sm text-gray-500">{viewerDocument.type.toUpperCase()} Document</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewerOpen(false);
                    setViewerDocument(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Document Viewer */}
              <div className="p-4">
                <div className="w-full bg-gray-50 rounded-lg overflow-hidden" style={{ height: 'calc(80vh - 200px)' }}>
                  {viewerDocument.type === 'pdf' ? (
                    <embed
                      src={viewerDocument.url}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      className="border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={viewerDocument.url}
                        alt={viewerDocument.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                <a
                  href={viewerDocument.url}
                  download={viewerDocument.name}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


