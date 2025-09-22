import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// POST /api/profile/upload - Upload profile documents
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'No document type provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPEG, JPG, and PNG files are allowed' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 });
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-documents')
      .getPublicUrl(fileName);

    // Update profile with document URL
    const updateField = `${documentType}_url`;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ [updateField]: publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      // Try to delete the uploaded file if profile update fails
      await supabase.storage
        .from('profile-documents')
        .remove([fileName]);
      return NextResponse.json({ error: 'Failed to update profile with document URL' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
