import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    const formData = await request.formData();

    const title = formData.get('title');
    if (title && typeof title !== 'string') return NextResponse.json({ error: 'Invalid title' }, { status: 400 });

    const content = formData.get('content');
    const publish_date = formData.get('publish_date');
    const file = formData.get('file') as File | null;

    let file_path: string | null = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(fileName, buffer, { contentType: file.type, cacheControl: '3600', upsert: false });
      if (uploadError) return NextResponse.json({ error: 'File upload failed', details: uploadError }, { status: 500 });
      const { data: urlData } = supabase.storage.from('announcements').getPublicUrl(fileName);
      file_path = urlData.publicUrl;
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };
    if (title) updatePayload.title = String(title).trim();
    if (content) updatePayload.content = String(content).trim();
    if (publish_date) updatePayload.publish_date = String(publish_date).trim();
    if (file_path) updatePayload.file_path = file_path;

    console.log('PATCH /api/announcements/[id] - updating id:', id, 'payload:', updatePayload);
    const { data, error } = await supabase
      .from('announcements')
      .update(updatePayload)
      .eq('announcements_id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('ERROR IN PATCH /api/announcements/[id]:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    console.log('DELETE /api/announcements/[id] - deleting id:', id);
    const { data, error } = await supabase.from('announcements').delete().eq('announcements_id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('ERROR IN DELETE /api/announcements/[id]:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
