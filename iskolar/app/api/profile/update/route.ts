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
      address_line2: userData.addressLine2 || null,
      barangay: userData.barangay || null,
      city: userData.city || null,
      province: userData.province || null,
      zip_code: userData.zipCode || null,
      region: userData.region || null,
      
      // Education info
      college: userData.college || null,
      course: userData.course || null,
      
      // Timestamp
      updated_at: new Date().toISOString(),
    };

    // Update user_metadata in auth.users
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        middle_name: userData.middleName,
        gender: userData.gender,
        birthdate: userData.birthdate,
        mobile_number: userData.mobile,
      }
    });

    if (updateAuthError) {
      console.error('Error updating auth user metadata:', updateAuthError);
      return NextResponse.json({ error: 'Failed to update user metadata' }, { status: 500 });
    }

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

    if (fetchError) {
      console.error('Error fetching updated profile:', fetchError);
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
      addressLine2: updatedProfile.address_line2 || '',
      barangay: updatedProfile.barangay || '',
      city: updatedProfile.city || '',
      province: updatedProfile.province || '',
      zipCode: updatedProfile.zip_code || '',
      region: updatedProfile.region || '',
      
      college: updatedProfile.college || '',
      course: updatedProfile.course || '',
      
      // Other fields
      scholarId: updatedProfile.scholar_id || '',
      createdAt: updatedProfile.created_at || '',
      updatedAt: updatedProfile.updated_at || '',
      status: updatedProfile.status || '',
    };

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      profile: responseData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      addressLine2: profile.address_line2 || '',
      barangay: profile.barangay || '',
      city: profile.city || '',
      province: profile.province || '',
      zipCode: profile.zip_code || '',
      region: profile.region || '',
      
      college: profile.college || '',
      course: profile.course || '',
      
      // Other fields
      scholarId: profile.scholar_id || '',
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
      status: profile.status || '',
    };

    return NextResponse.json({ profile: responseData });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}