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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const publish_date = formData.get('publish_date') as string;
    const attachmentFile = formData.get('attachmentFile') as File | null;

    let attachment: string | null = null;

    if (attachmentFile) {
      const filePath = `public/${Date.now()}_${attachmentFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, attachmentFile);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      attachment = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({ title, content, publish_date, attachment })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('ERROR IN POST /api/announcements:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}