'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BrandedLoader from "@/app/components/ui/BrandedLoader";
import { supabase } from "@/lib/supabaseClient";
import ScholarSideBar from "@/app/components/ScholarSideBar";

// Common input style
const inputClassName = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#2196f3] focus:border-[#2196f3] focus:outline-none bg-white hover:border-gray-400";

// Barangay and ZIP code mapping
export default function ApplicationPage() {
  const params = useParams();
  const semesterId = params.semesterId as string;
  const schoolYearId = params.schoolYearId as string;

  // Track if user has already submitted an application
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Stepper state: 0 = Personal Info, 1 = Documents
  const [step, setStep] = useState(0);

  // Handle form submission
  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring click');
      return;
    }

    console.log('=== SUBMIT CLICKED ===');
    setIsSubmitting(true);

    try {
      // Check authentication
      console.log('Checking authentication...');
      console.log('Supabase client initialized:', !!supabase);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check complete - User:', !!user, 'Error:', !!authError);
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) {
        console.error('No user found in session');
        throw new Error('Please sign in to submit your application');
      }

      console.log('✓ User authenticated:', user.id);
      console.log('Starting submission process...');

      // Validate required fields
      console.log('Validating required fields...');
      const requiredFields = {
        'Years of Residency': yearsOfResidency,
        'Junior High School Name': juniorHighName,
        'Junior High School Address': juniorHighAddress,
        'Junior High Year Started': juniorHighYearStarted,
        'Junior High Year Graduated': juniorHighYearGraduated,
        'Senior High School Name': seniorHighName,
        'Senior High School Address': seniorHighAddress,
        'Senior High Year Started': seniorHighYearStarted,
        'Senior High Year Graduated': seniorHighYearGraduated,
        'College Address': collegeAddress,
        'Year Level': yearLevel,
        'College Year Started': collegeYearStarted,
        'Expected Graduation': collegeExpectedGraduation,
        "Mother's Maiden Name": motherMaidenName,
        "Father's Name": fatherName
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        throw new Error(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
      }

      console.log('✓ Required fields validated');

      // Validate document uploads
      console.log('Validating documents...');
      const requiredDocuments = [
        { name: "PSA Birth Certificate", fileName: birthCertFileName },
        { name: "Student's Voter's Certification", fileName: voterCertFileName },
        { name: "Guardian's Voter's Certification", fileName: guardianVoterFileName },
        { name: "Barangay ID", fileName: brgyIdFileName },
        { name: "Valid ID or School ID", fileName: idFileName },
        { name: "Certificate of Registration", fileName: regFileName },
        { name: "Certificate of Grades", fileName: gradesFileName }
      ];

      const missingDocuments = requiredDocuments
        .filter(doc => !doc.fileName)
        .map(doc => doc.name);

      if (missingDocuments.length > 0) {
        console.error('Missing documents:', missingDocuments);
        throw new Error(`Please upload the following required documents:\n${missingDocuments.join('\n')}`);
      }

      console.log('✓ Documents validated');

      // Validate semester_id first
      console.log('Checking semester ID:', semesterId);
      if (!semesterId) {
        throw new Error('Semester ID is required');
      }
      console.log('✓ Semester ID valid');

      // Check for existing application for THIS semester
      console.log('Checking for existing application...');
      const { data: existingApp, error: checkError } = await supabase
        .from('application_details')
        .select('appdet_id')
        .eq('user_id', user.id)
        .eq('semester_id', semesterId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing application:', checkError);
        throw new Error('Error checking existing application: ' + checkError.message);
      }

      if (existingApp) {
        console.log('Existing application found:', existingApp);
        throw new Error('You have already submitted an application for this semester');
      }
      
      console.log('✓ No existing application found');

      // Start the database transaction
      console.log('Starting database transaction...');

      // 1. Save application details
      const applicationData = {
        user_id: user.id,
        semester_id: semesterId,
        years_of_residency: parseInt(yearsOfResidency),
        junior_high_school_name: juniorHighName.trim(),
        junior_high_school_address: juniorHighAddress.trim(),
        junior_high_year_started: parseInt(juniorHighYearStarted),
        junior_high_year_ended: parseInt(juniorHighYearGraduated),
        senior_high_school_name: seniorHighName.trim(),
        senior_high_school_address: seniorHighAddress.trim(),
        senior_high_year_started: parseInt(seniorHighYearStarted),
        senior_high_year_ended: parseInt(seniorHighYearGraduated),
        college_address: collegeAddress.trim(),
        year_level: parseInt(yearLevel),
        college_year_started: parseInt(collegeYearStarted),
        college_year_grad: parseInt(collegeExpectedGraduation),
        mother_maiden_name: motherMaidenName.trim(),
        mother_occupation: motherJob ? motherJob.trim() : null,
        father_full_name: fatherName.trim(),
        father_occupation: fatherJob ? fatherJob.trim() : null
      };

      console.log('Application data to insert:', applicationData);
      console.log('Saving application details...');
      
      const { data: insertedApp, error: applicationError } = await supabase
        .from('application_details')
        .insert([applicationData])
        .select()
        .single();

      if (applicationError) {
        console.error('Database insertion error:', applicationError);
        throw new Error('Failed to save application details: ' + applicationError.message);
      }
      
      console.log('Application saved successfully:', insertedApp);

      // 2. Upload and save documents
      console.log('Processing document uploads...');
      console.log('Uploaded files count:', Object.keys(uploadedFiles).length);
      console.log('Uploaded files:', Object.keys(uploadedFiles));
      
      const documentTypeMap: Record<string, string> = {
        'birthCert': 'PSA Birth Certificate',
        'voterCert': 'Student\'s Voter\'s Certification',
        'guardianVoter': 'Guardian\'s Voter\'s Certification',
        'brgyId': 'Barangay ID',
        'validId': 'Valid ID or School ID',
        'regCert': 'Certificate of Registration',
        'grades': 'Certificate of Grades'
      };

      for (const [type, fileInfo] of Object.entries(uploadedFiles)) {
        console.log(`Uploading ${type}...`);
        const timestamp = Date.now();
        const filePath = `${user.id}/${type}/${timestamp}_${fileInfo.file.name}`;
        
        // Upload file to storage
        console.log(`Uploading file to storage: ${filePath}`);
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileInfo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${type}:`, uploadError);
          throw new Error(`Failed to upload ${documentTypeMap[type]}: ${uploadError.message}`);
        }
        console.log(`✓ File uploaded: ${type}`);

        // Save document metadata
        const documentData = {
          document_type: documentTypeMap[type],
          file_name: fileInfo.file.name,
          file_path: filePath,
          file_size: fileInfo.file.size,
          user_id: user.id
        };
        
        console.log('Inserting document metadata:', documentData);
        
        const { error: metadataError } = await supabase
          .from('documents')
          .insert([documentData]);

        if (metadataError) {
          console.error(`Metadata error for ${type}:`, metadataError);
          throw new Error(`Failed to save metadata for ${documentTypeMap[type]}: ${metadataError.message}`);
        }
        console.log(`✓ Metadata saved: ${type}`);
      }
      
      console.log('✓ All documents processed');

      console.log('Application submitted successfully!');
      setHasExistingApplication(true);
      alert('✅ Application submitted successfully! You will be redirected to the status page.');
      
    } catch (error: unknown) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      console.error('Error message:', errorMessage);
      
      alert('❌ Submission Failed:\n\n' + errorMessage);
    } finally {
      console.log('=== SUBMISSION COMPLETE ===');
      setIsSubmitting(false);
    }
  };

  // Personal Info from users table
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [yearsOfResidency, setYearsOfResidency] = useState("");
  // Address states
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  // College info from users table
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");

  // Fetch user data and check for existing application
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoadingData(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingData(false);
          return;
        }

        // Parallel fetch for better performance - fetch all data at once
        const [applicationResult, userResult, documentsResult] = await Promise.all([
          supabase
            .from('application_details')
            .select('*')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
        ]);

        // Check for existing application
        if (!applicationResult.error && applicationResult.data) {
          setHasExistingApplication(true);
          setIsLoadingData(false);
          return;
        }

        // Set user profile data
        if (userResult.data) {
          const userData = userResult.data;
          setLastName(userData.last_name);
          setFirstName(userData.first_name);
          setMiddleName(userData.middle_name || "");
          setEmail(userData.email_address);
          setContactNumber(userData.mobile_number);
          setGender(userData.gender);
          setBirthdate(new Date(userData.birthdate).toISOString().split('T')[0]);
          setAddressLine1(userData.address_line1);
          setAddressLine2(userData.address_line2 || "");
          setBarangay(userData.barangay);
          setZipCode(userData.zip_code);
          setCollegeName(userData.college_university);
          setCourse(userData.college_course);
        }

        // Map documents to their respective state variables
        if (documentsResult.data) {
          documentsResult.data.forEach(doc => {
            switch (doc.document_type) {
              case 'PSA Birth Certificate':
                setBirthCertFileName(doc.file_name);
                break;
              case 'Student\'s Voter\'s Certification':
                setVoterCertFileName(doc.file_name);
                break;
              case 'Guardian\'s Voter\'s Certification':
                setGuardianVoterFileName(doc.file_name);
                break;
              case 'Barangay ID':
                setBrgyIdFileName(doc.file_name);
                break;
              case 'Valid ID or School ID':
                setIdFileName(doc.file_name);
                break;
              case 'Certificate of Registration':
                setRegFileName(doc.file_name);
                break;
              case 'Certificate of Grades':
                setGradesFileName(doc.file_name);
                break;
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchUserData();
  }, []);

  // File validation and upload
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB');
      return false;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only PDF, JPG, JPEG, and PNG files are allowed');
      return false;
    }
    return true;
  };

  // Store uploaded files in memory until form submission
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { file: File; type: string }>>({});

  const handleFileUpload = async (file: File, type: string) => {
    try {
      console.log(`Validating file for ${type}...`);
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      // Map document types to enum values
      const documentTypeMap: Record<string, string> = {
        'birthCert': 'PSA Birth Certificate',
        'voterCert': 'Student\'s Voter\'s Certification',
        'guardianVoter': 'Guardian\'s Voter\'s Certification',
        'brgyId': 'Barangay ID',
        'validId': 'Valid ID or School ID',
        'regCert': 'Certificate of Registration',
        'grades': 'Certificate of Grades'
      };

      if (!documentTypeMap[type]) {
        throw new Error(`Invalid document type: ${type}`);
      }

      // Store the file in memory
      setUploadedFiles(prev => ({
        ...prev,
        [type]: { file, type }
      }));

      // Update UI
      console.log('Updating UI...');
      switch (type) {
        case 'birthCert':
          setBirthCertFileName(file.name);
          break;
        case 'voterCert':
          setVoterCertFileName(file.name);
          break;
        case 'guardianVoter':
          setGuardianVoterFileName(file.name);
          break;
        case 'brgyId':
          setBrgyIdFileName(file.name);
          break;
        case 'validId':
          setIdFileName(file.name);
          break;
        case 'regCert':
          setRegFileName(file.name);
          break;
        case 'grades':
          setGradesFileName(file.name);
          break;
        default:
          throw new Error(`Unknown document type: ${type}`);
      }

      console.log(`Successfully uploaded ${type}`);

    } catch (error) {
      console.error('Error uploading file:', error);
      // Reset the file name state for the failed upload
      switch (type) {
        case 'birthCert':
          setBirthCertFileName('');
          break;
        case 'voterCert':
          setVoterCertFileName('');
          break;
        case 'guardianVoter':
          setGuardianVoterFileName('');
          break;
        case 'brgyId':
          setBrgyIdFileName('');
          break;
        case 'validId':
          setIdFileName('');
          break;
        case 'regCert':
          setRegFileName('');
          break;
        case 'grades':
          setGradesFileName('');
          break;
      }
      
      // Show specific error message
      alert(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    }
  };

  const [juniorHighName, setJuniorHighName] = useState("");
  const [juniorHighAddress, setJuniorHighAddress] = useState("");
  const [juniorHighYearStarted, setJuniorHighYearStarted] = useState("");
  const [juniorHighYearGraduated, setJuniorHighYearGraduated] = useState("");
  const [seniorHighName, setSeniorHighName] = useState("");
  const [seniorHighAddress, setSeniorHighAddress] = useState("");
  const [seniorHighYearStarted, setSeniorHighYearStarted] = useState("");
  const [seniorHighYearGraduated, setSeniorHighYearGraduated] = useState("");
  const [seniorHighStrand, setSeniorHighStrand] = useState("");
  
  const [collegeAddress, setCollegeAddress] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [collegeYearStarted, setCollegeYearStarted] = useState("");
  const [collegeExpectedGraduation, setCollegeExpectedGraduation] = useState("");
  const [motherMaidenName, setMotherMaidenName] = useState("");
  const [motherJob, setMotherJob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherJob, setFatherJob] = useState("");

  // Document Uploads
  const [regFileName, setRegFileName] = useState("");
  const [birthCertFileName, setBirthCertFileName] = useState("");
  const [brgyIdFileName, setBrgyIdFileName] = useState("");
  const [voterCertFileName, setVoterCertFileName] = useState("");
  const [guardianVoterFileName, setGuardianVoterFileName] = useState("");
  const [idFileName, setIdFileName] = useState("");
  const [gradesFileName, setGradesFileName] = useState("");

  const steps = [
    { label: "Personal" },
    { label: "Documents" },
  ];

  // Full-page loading screen
  if (isLoadingData) {
    return (
      <>
        <ScholarSideBar />
        <BrandedLoader title="Loading Application Form" subtitle="Preparing your application..." />
      </>
    );
  }

  if (hasExistingApplication) {
    return (
      <>
        <ScholarSideBar />
        <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex items-center justify-center">
          <div className="w-full max-w-xl px-8 -mt-32">
            <div className="bg-white rounded-xl shadow p-8 w-full text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#e3f2fd]">
                <svg
                  className="w-12 h-12 text-[#2196f3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Application Already Submitted
            </h2>
            <p className="text-gray-600 mb-8">
              You have already submitted an application for this semester. Please visit the status page to check your application status.
            </p>
            <a 
              href={`/${schoolYearId}/${semesterId}/status`}
              className="inline-block bg-[#2196f3] text-white px-8 py-3 rounded-lg font-medium shadow-md hover:bg-[#1976d2] hover:shadow-lg transition-all duration-200"
            >
              Check Application Status
            </a>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ScholarSideBar />
      <div className="min-h-screen w-full bg-[#f5f6fa] pl-64 flex flex-col items-center">
      {/* Stepper */}
      <div className="w-full flex flex-col items-center pt-20 pb-6">
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
                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={lastName} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={firstName} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Middle Name</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={middleName} readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={email} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                    <input required type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={contactNumber} readOnly />
                  </div>
                </div>

                {/* Gender & Birthdate */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender <span className="text-red-500">*</span></label>
                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={gender} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Birthdate <span className="text-red-500">*</span></label>
                    <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={birthdate} readOnly />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6 mb-2 font-semibold text-gray-700">Address</div>
                <div className="grid grid-cols-1 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 1 (House/Unit/Building + Street) <span className="text-red-500">*</span></label>
                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={addressLine1} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address Line 2 (Subdivision/Village/Purok/Sitio)</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={addressLine2} readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Barangay <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" 
                      value={barangay}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City/Municipality</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value="Makati City" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ZIP Code <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" 
                      value={zipCode} 
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Years of Residency <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="number"
                      min="0"
                      max="100"
                      className={inputClassName} 
                      value={yearsOfResidency} 
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                          setYearsOfResidency(value);
                        }
                      }}
                      placeholder="Enter number of years"
                    />
                    {yearsOfResidency && (Number(yearsOfResidency) < 0 || Number(yearsOfResidency) > 100) && (
                      <p className="text-xs text-red-500 mt-1">Years must be between 0 and 100</p>
                    )}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        min="2000"
                        max="2030"
                        className={inputClassName} 
                        value={juniorHighYearStarted} 
                        onChange={e => setJuniorHighYearStarted(e.target.value)}
                        placeholder="YYYY"
                      />
                      {juniorHighYearStarted && (Number(juniorHighYearStarted) < 2000 || Number(juniorHighYearStarted) > 2030) && (
                        <p className="text-xs text-red-500 mt-1">Year must be between 2000 and 2030</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Graduated <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        min="2000"
                        max="2030"
                        className={inputClassName} 
                        value={juniorHighYearGraduated} 
                        onChange={e => setJuniorHighYearGraduated(e.target.value)}
                        placeholder="YYYY"
                      />
                      {juniorHighYearGraduated && (Number(juniorHighYearGraduated) < 2000 || Number(juniorHighYearGraduated) > 2030) && (
                        <p className="text-xs text-red-500 mt-1">Year must be between 2000 and 2030</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Senior High School Name <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={seniorHighName} onChange={e => setSeniorHighName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Senior High School Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={seniorHighAddress} onChange={e => setSeniorHighAddress(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        min="2000"
                        max="2030"
                        className={inputClassName} 
                        value={seniorHighYearStarted} 
                        onChange={e => setSeniorHighYearStarted(e.target.value)}
                        placeholder="YYYY"
                      />
                      {seniorHighYearStarted && (Number(seniorHighYearStarted) < 2000 || Number(seniorHighYearStarted) > 2030) && (
                        <p className="text-xs text-red-500 mt-1">Year must be between 2000 and 2030</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Graduated <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        min="2000"
                        max="2030"
                        className={inputClassName} 
                        value={seniorHighYearGraduated} 
                        onChange={e => setSeniorHighYearGraduated(e.target.value)}
                        placeholder="YYYY"
                      />
                      {seniorHighYearGraduated && (Number(seniorHighYearGraduated) < 2000 || Number(seniorHighYearGraduated) > 2030) && (
                        <p className="text-xs text-red-500 mt-1">Year must be between 2000 and 2030</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Strand <span className="text-red-500">*</span></label>
                    <select required className={inputClassName} value={seniorHighStrand} onChange={e => setSeniorHighStrand(e.target.value)}>
                      <option value="">Select Strand</option>
                      <option value="STEM">STEM (Science, Technology, Engineering, and Mathematics)</option>
                      <option value="ABM">ABM (Accountancy, Business and Management)</option>
                      <option value="HUMSS">HUMSS (Humanities and Social Sciences)</option>
                      <option value="GAS">GAS (General Academic Strand)</option>
                      <option value="TVL">TVL (Technical-Vocational-Livelihood)</option>
                      <option value="Arts and Design">Arts and Design</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">College or University Name <span className="text-red-500">*</span></label>
                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={collegeName} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">College or University Address <span className="text-red-500">*</span></label>
                    <input required className={inputClassName} value={collegeAddress} onChange={e => setCollegeAddress(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year Started <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        className={inputClassName} 
                        value={collegeYearStarted} 
                        onChange={e => setCollegeYearStarted(e.target.value)}
                        placeholder="YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expected Year of Graduation <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="number"
                        className={inputClassName} 
                        value={collegeExpectedGraduation} 
                        onChange={e => setCollegeExpectedGraduation(e.target.value)}
                        placeholder="YYYY"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Year Level <span className="text-red-500">*</span></label>
                      <select required className={inputClassName} value={yearLevel} onChange={e => setYearLevel(e.target.value)}>
                        <option value="">Select Year Level</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="col-span-8">
                      <label className="block text-xs text-gray-500 mb-1">Course <span className="text-red-500">*</span></label>
                      <input required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100" value={course} readOnly />
                    </div>
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
            <div className="mb-6 bg-linear-to-r from-[#e3f2fd] to-[#f8fafc] rounded-xl px-5 py-4 border border-[#B6D6F6] shadow-sm flex flex-col justify-center">
              <div className="text-[15px] text-[#1976d2] font-semibold">
                Upload the following documents to complete your application.
              </div>
              <div className="text-xs text-gray-500">
                Please upload clear and valid copies of your documents below.
              </div>
            </div>
            
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
              {/* PSA Birth Certificate */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">PSA Birth Certificate</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'birthCert');
                        } else {
                          e.target.value = '';
                          setBirthCertFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{birthCertFileName}</span>
                </div>
              </div>
              {/* Student's Voter's Certification */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Student&apos;s Voter&apos;s Certification</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'voterCert');
                        } else {
                          e.target.value = '';
                          setVoterCertFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{voterCertFileName}</span>
                </div>
              </div>
              {/* Guardian's Voter's Certification */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Guardian&apos;s Voter&apos;s Certification</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'guardianVoter');
                        } else {
                          e.target.value = '';
                          setGuardianVoterFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{guardianVoterFileName}</span>
                </div>
              </div>
              {/* Barangay ID */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Barangay ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'brgyId');
                        } else {
                          e.target.value = '';
                          setBrgyIdFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{brgyIdFileName}</span>
                </div>
              </div>
              {/* Valid ID or School ID */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Valid ID or School ID</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'validId');
                        } else {
                          e.target.value = '';
                          setIdFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{idFileName}</span>
                </div>
              </div>
              {/* Certificate of Registration */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Certificate of Registration</label>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#F8F9FB] border-2 border-dashed border-[#90caf9]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer block w-full text-sm text-gray-700 bg-transparent file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e3f2fd] file:text-[#1976d2] file:font-medium"
                    onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        if (validateFile(e.target.files[0])) {
                          await handleFileUpload(e.target.files[0], 'regCert');
                        } else {
                          e.target.value = '';
                          setRegFileName('');
                        }
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
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (validateFile(file)) {
                          await handleFileUpload(file, 'grades');
                        } else {
                          e.target.value = '';
                          setGradesFileName('');
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500 truncate">{gradesFileName}</span>
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
                className="cursor-pointer bg-[#2196f3] text-white px-8 py-2 rounded-lg font-medium shadow hover:bg-[#1976d2] transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}