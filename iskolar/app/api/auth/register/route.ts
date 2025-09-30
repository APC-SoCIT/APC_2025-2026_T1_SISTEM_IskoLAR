import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
 
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
    const { email, password, firstName, lastName, middleName, gender, birthdate, mobile } = await request.json()
 
    // Clean and validate mobile number
    const cleanedMobile = mobile.replace(/\D/g, '')
    if (cleanedMobile.length < 7 || cleanedMobile.length > 15) {
      return NextResponse.json({ error: 'Phone number must be between 7 and 15 digits' }, { status: 400 })
    }
 
    // Create user in Supabase Auth
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
 
    // Insert into your custom users table
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || null,
        gender: gender || null,
        birthdate: birthdate || null,
        email_address: email,
        mobile_number: cleanedMobile,
        // ⚠️ CAUTION: Storing plain passwords is insecure
        // If required, hash it before inserting.
        password,
      })
      .select()
 
    if (insertError) {
      console.error('Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
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