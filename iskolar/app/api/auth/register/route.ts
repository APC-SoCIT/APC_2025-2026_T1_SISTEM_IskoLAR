import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { UserRegistration, userValidation } from '@/lib/types/user'
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
 
export async function POST(request: NextRequest) {
  try {
    const userData: UserRegistration = await request.json()
    const { 
      email, password, firstName, lastName, middleName, 
      gender, birthdate, mobile, 
      addressLine1, addressLine2, barangay, city, province, zipCode, region,
      college, course
    } = userData
 
    // Clean and validate mobile number
    const mobileValidation = userValidation.validateMobile(mobile)
    if (!mobileValidation.isValid) {
      return NextResponse.json({ error: mobileValidation.error }, { status: 400 })
    }
    const cleanedMobile = mobileValidation.value
    
    // Validate ZIP code if provided
    if (zipCode && !userValidation.validateZipCode(zipCode)) {
      return NextResponse.json({ error: 'ZIP code must be exactly 4 digits' }, { status: 400 })
    }
 
    // Create auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        gender,
        birthdate,
        mobile_number: cleanedMobile,
      },
      app_metadata: {
        role: 'User',
        display_name: `${firstName} ${lastName}`,
      },
    })
 
    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError?.message || 'User creation failed' }, { status: 400 })
    }
 
    // Prepare data for users table insertion - do not include password as it's only stored in auth
    const userInsertData = {
      user_id: authData.user.id,
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName || null,
      gender: gender || null,
      birthdate: birthdate || null,
      email_address: email,
      mobile_number: cleanedMobile,
      address_line1: addressLine1 || null,
      address_line2: addressLine2 || null,
      barangay: barangay || null,
      city: city || null,
      province: province || null,
      zip_code: zipCode || null,
      region: region || null,
      college: college || null,
      course: course || null,
      year_level: 1, // Default to 1st year for new registrations
      GPA: 0, // Default GPA for new registrations
      birth_certificate: '', // Empty string for document URL, to be updated later
      voters_certification: '', // Empty string for document URL, to be updated later
      national_id: '', // Empty string for document URL, to be updated later
      created_at: new Date().toISOString(),
      profile_update_history: [{
        timestamp: new Date().toISOString(),
        action: 'created',
        changes: 'Initial registration'
      }],
      status: 'pending'
    }
    
    // Insert into users table
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(userInsertData)
      .select()
 
    if (insertError) {
      // If users table insert fails, clean up by deleting the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      console.error('Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })

      // Check if error is due to duplicate mobile number
      if (insertError.code === '23505' && insertError.message.includes('users_mobile_number_key')) {
        return NextResponse.json({
          error: 'This mobile number is already registered. Please use a different number.',
          code: 'DUPLICATE_MOBILE'
        }, { status: 400 })
      }

      return NextResponse.json({
        error: insertError.message,
        details: insertError.details,
        code: insertError.code
      }, { status: 400 })
    }
 
    console.log('✅ User registered and inserted into custom table')
    return NextResponse.json({ success: true, authUser: authData.user, profile: insertData })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}