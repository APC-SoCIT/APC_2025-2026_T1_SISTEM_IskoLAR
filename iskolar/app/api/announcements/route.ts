import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('ERROR IN GET /api/announcements:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Processing POST request...');
    const formData = await request.formData();
    
    // Log all form data entries for debugging
    console.log('Form data entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? 
        { name: value.name, type: value.type, size: value.size } : 
        value
      );
    }
    
    // Validate required fields
    const title = formData.get('title');
    if (!title || typeof title !== 'string') {
      console.error('Title validation failed:', { receivedTitle: title, type: typeof title });
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Handle optional fields with proper type checking
    const content = formData.get('content');
    const contentString = content ? String(content).trim() : null;
    
    const publish_date = formData.get('publish_date');
    // Only set publish_date if it's not empty
    const publish_date_string = publish_date && String(publish_date).trim() !== '' ? String(publish_date) : null;
    
    const file = formData.get('file') as File | null;
    
    console.log('Processed form data:', {
      title,
      content: contentString,
      contentLength: contentString?.length ?? 0,
      publish_date: publish_date_string,
      hasFile: !!file
    });

    let file_path: string | null = null;

    if (file) {
      // Validate file size (e.g., 10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      // Create a unique file name to prevent conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log('Attempting file upload to Supabase...');
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload response:', { uploadData, uploadError });

      if (uploadError) {
        console.error('File upload error:', {
          message: uploadError.message,
          details: uploadError,
          name: uploadError.name
        });
        return NextResponse.json({ 
          error: 'Failed to upload file', 
          details: {
            message: uploadError.message,
            name: uploadError.name
          },
          hint: 'This might be a permissions issue. Please check storage policies.'
        }, { status: 500 });
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('announcements')
        .getPublicUrl(fileName);

      file_path = urlData.publicUrl;
    }

    // Insert the announcement with file_path
    console.log('Inserting announcement into database:', {
      title,
      content: contentString,
      contentLength: contentString?.length ?? 0,
      publish_date: publish_date_string,
      has_file_path: !!file_path
    });

    const { data, error } = await supabase
      .from('announcements')
      .insert({ 
        title, 
        content: contentString, 
        publish_date: publish_date_string,
        file_path,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }
    
    console.log('Announcement created successfully:', data);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('ERROR IN POST /api/announcements:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}