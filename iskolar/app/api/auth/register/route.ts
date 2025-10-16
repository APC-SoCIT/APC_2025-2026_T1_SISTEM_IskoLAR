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
      email, password, first_name, last_name, middle_name, 
      gender, birthdate, contact_number, 
      address_line1, address_line2, barangay, city, province, zip_code, region,
      college_name, course
    } = userData
 
    // Clean and validate contact number
    const contactValidation = userValidation.validateContactNumber(contact_number)
    if (!contactValidation.isValid) {
      return NextResponse.json({ error: contactValidation.error }, { status: 400 })
    }
    const cleanedContactNumber = contactValidation.value
    
    // Validate ZIP code if provided
    if (zip_code && !userValidation.validateZipCode(zip_code)) {
      return NextResponse.json({ error: 'ZIP code must be exactly 4 digits' }, { status: 400 })
    }
 
    // Create auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        middle_name,
        gender,
        birthdate,
        contact_number: cleanedContactNumber,
      },
      app_metadata: {
        role: 'User',
        display_name: `${first_name} ${last_name}`,
      },
    })
 
    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError?.message || 'User creation failed' }, { status: 400 })
    }
 
    // Prepare data for users table insertion - do not include password as it's only stored in auth
    const userInsertData = {
      user_id: authData.user.id,
      last_name,
      first_name,
      middle_name: middle_name || null,
      gender: gender || null,
      birthdate: birthdate || null,
      email_address: email,
      contact_number: cleanedContactNumber,
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      barangay: barangay || null,
      city: city || null,
      province: province || null,
      zip_code: zip_code || null,
      region: region || null,
      created_at: new Date().toISOString(),
      profile_update_history: [{
        timestamp: new Date().toISOString(),
        action: 'created',
        changes: 'Initial registration'
      }]
    }

    // Prepare data for applications table
    const applicationData = {
      user_id: authData.user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Prepare data for application_details table
    const applicationDetailsData = {
      user_id: authData.user.id,
      college_name: college_name || null,
      course: course || null,
      created_at: new Date().toISOString()
    }
    
    // Insert into users table
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(userInsertData)
      .select()
 
    if (insertError) {
      // If users table insert fails, clean up by deleting the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({
        error: insertError.message,
        details: insertError.details,
        code: insertError.code
      }, { status: 400 })
    }

    // Get the current year and determine semester
    const currentDate = new Date()
    const nextYear = currentDate.getFullYear() + 1
    const academicYear = `${currentDate.getFullYear()}-${nextYear}`
    
    // Determine semester based on current month
    // First semester: August to December
    // Second semester: January to May
    // Third semester (Summer): June to July
    const month = currentDate.getMonth() + 1 // getMonth() returns 0-11
    let semester
    if (month >= 6 && month <= 12) {
      semester = "First Semester" // First semester
    } else if (month >= 1 && month <= 4) {
      semester = "Second Semester" // Second semester
    } else {
      semester = "Summer Term" // Summer/Third semester
    }

    // Insert into applications table
    const { data: applicationInsertData, error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: authData.user.id,  // Foreign key to users table
        status: 'pending',
        academic_year: academicYear,
        semester: semester,
        created_at: new Date().toISOString()
      })
      .select('applications_id')

    if (applicationError || !applicationInsertData || applicationInsertData.length === 0) {
      // Log detailed error information
      console.error('Application creation error:', {
        message: applicationError?.message,
        details: applicationError?.details,
        hint: applicationError?.hint,
        code: applicationError?.code
      })
      
      // If applications insert fails, clean up by deleting the user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('users').delete().eq('user_id', authData.user.id)
      return NextResponse.json({
        error: 'Failed to create application',
        details: applicationError?.message || 'No application data returned'
      }, { status: 400 })
    }

    console.log('Application insert data:', applicationInsertData[0])
    const applicationId = applicationInsertData[0].applications_id
    console.log('Created application with ID:', applicationId)

    // Insert into application_details table with minimal required fields
    const { data: detailsInsertData, error: applicationDetailsError } = await supabaseAdmin
      .from('application_details')
      .insert({
        application_id: applicationId,
        college_name: college_name || '',
        course: course || '',
        mother_maiden_name: '',  // Empty string instead of null
        father_name: '',
        father_occupation: '',
        mother_occupation: '',
        created_at: new Date().toISOString()
      })
      .select()

    if (applicationDetailsError) {
      // Log detailed error information
      console.error('Application details creation error:', {
        message: applicationDetailsError.message,
        details: applicationDetailsError.details,
        hint: applicationDetailsError.hint,
        code: applicationDetailsError.code,
        data: {
          applications_id: applicationId,
          college_name,
          course
        }
      })
      
      // If application_details insert fails, clean up everything
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('users').delete().eq('user_id', authData.user.id)
      await supabaseAdmin.from('applications').delete().eq('user_id', authData.user.id)
      return NextResponse.json({
        error: 'Failed to create application details',
        details: applicationDetailsError.message
      }, { status: 400 })
    }
 
    console.log('✅ User registered with application and details created')
    return NextResponse.json({ 
      success: true, 
      authUser: authData.user, 
      profile: insertData,
      redirectUrl: '/scholar/announcements' // Add redirect URL for frontend
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}