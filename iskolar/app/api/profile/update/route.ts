import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, userValidation } from '@/lib/types/user';

// PUT /api/profile/update - Update user profile data
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get the user profile data from request
    const userData: UserProfile = await request.json();

    // Clean and validate mobile number
    if (userData.mobile) {
      const mobileValidation = userValidation.validateMobile(userData.mobile);
      if (!mobileValidation.isValid) {
        return NextResponse.json({ error: mobileValidation.error }, { status: 400 });
      }
      userData.mobile = mobileValidation.value as string;
    }

    // Validate ZIP code if provided
    if (userData.zipCode && !userValidation.validateZipCode(userData.zipCode)) {
      return NextResponse.json({ 
        error: 'ZIP code must be exactly 4 digits' 
      }, { status: 400 });
    }

    // Format the data for database update
    const userUpdateData = {
      // Personal info
      first_name: userData.firstName,
      last_name: userData.lastName,
      middle_name: userData.middleName || null,
      gender: userData.gender || null,
      birthdate: userData.birthdate || null,
      mobile_number: userData.mobile,
      
      // Address info
      address_line1: userData.addressLine1 || null,
      address_line2: userData.addressLine2 || null, // Updated to match schema
      barangay: userData.barangay || null,
      city: userData.city || null,
      province: userData.province || null,
      zip_code: userData.zipCode || null, // Updated to match schema
      region: userData.region || null,
      
      // Education info
      college: userData.college || null, // Fixed to match actual column name
      course: userData.course || null,
      
      // Document URLs - if provided
      birth_certificate: userData.psaDocumentUrl || null, // Updated to match schema
      voters_certification: userData.voterDocumentUrl || null, // Updated to match schema
      national_id: userData.nationalIdDocumentUrl || null, // Updated to match schema
      
      // Timestamp
      updated_at: new Date().toISOString(),
    };

    // Skip updating user_metadata in auth.users - it's causing problems
    // and the critical user data is still updated in the users table
    // We'll revisit this feature in the future
    console.log('Skipping auth metadata update - this feature is temporarily disabled');

    // Update in users table
    const { error: updateError } = await supabase
      .from('users')
      .update(userUpdateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json({ 
        error: updateError.message || 'Failed to update profile',
        details: updateError.details
      }, { status: 500 });
    }

    // Get the updated user profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !updatedProfile) {
      console.error('Error fetching updated profile:', fetchError);
      // Return success but without profile data - client will need to fetch it separately
      return NextResponse.json({ 
        success: true, 
        message: 'Profile updated successfully, but failed to fetch the updated profile'
      });
    }

    // Format response data to match our UserProfile interface
    const responseData: UserProfile = {
      userId: updatedProfile.user_id,
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      middleName: updatedProfile.middle_name || '',
      gender: updatedProfile.gender || '',
      birthdate: updatedProfile.birthdate || '',
      email: updatedProfile.email_address,
      mobile: updatedProfile.mobile_number || '',
      
      addressLine1: updatedProfile.address_line1 || '',
      addressLine2: updatedProfile.address_line2 || '', // Updated to match schema
      barangay: updatedProfile.barangay || '',
      city: updatedProfile.city || '',
      province: updatedProfile.province || '',
      zipCode: updatedProfile.zip_code || '', // Updated to match schema
      region: updatedProfile.region || '',
      
      college: updatedProfile.college || '',
      course: updatedProfile.course || '',
      
      // Document URLs
      psaDocumentUrl: updatedProfile.birth_certificate || '',
      voterDocumentUrl: updatedProfile.voters_certification || '',
      nationalIdDocumentUrl: updatedProfile.national_id || '',
      
      // Other fields
      scholarId: updatedProfile.scholar_id || '',
      createdAt: updatedProfile.created_at || '',
      updatedAt: updatedProfile.updated_at || '',
      status: updatedProfile.status || '',
      
      // Academic info
      yearLevel: updatedProfile.year_level || '',
      gpa: updatedProfile.GPA || '',
    };

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      profile: responseData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}

// GET /api/profile/update - Get current user profile data
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get the user profile
    const { data: profile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Format response data to match our UserProfile interface
    const responseData: UserProfile = {
      userId: profile.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      middleName: profile.middle_name || '',
      gender: profile.gender || '',
      birthdate: profile.birthdate || '',
      email: profile.email_address,
      mobile: profile.mobile_number || '',
      
      addressLine1: profile.address_line1 || '',
      addressLine2: profile.address_line2 || '', // Updated to match schema
      barangay: profile.barangay || '',
      city: profile.city || '',
      province: profile.province || '',
      zipCode: profile.zip_code || '', // Updated to match schema
      region: profile.region || '',
      
      college: profile.college || '',
      course: profile.course || '',
      
      // Document URLs
      psaDocumentUrl: profile.birth_certificate || '',
      voterDocumentUrl: profile.voters_certification || '',
      nationalIdDocumentUrl: profile.national_id || '',
      
      // Academic fields
      yearLevel: profile.year_level || '',
      gpa: profile.GPA || '',
      
      // Other fields
      scholarId: profile.scholar_id || '',
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
      status: profile.status || '',
      lastLogin: profile.last_login || '',
    };

    return NextResponse.json({ profile: responseData });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}