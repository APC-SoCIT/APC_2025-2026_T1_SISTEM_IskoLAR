import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = context.params;
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const publish_date = formData.get('publish_date') as string;
    const attachmentFile = formData.get('attachmentFile') as File | null;
    
    const updateData: { title: string; content: string; publish_date: string; attachment?: string } = { title, content, publish_date };

    if (attachmentFile) {
      const filePath = `public/${Date.now()}_${attachmentFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, attachmentFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      updateData.attachment = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('announcement_id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`ERROR IN PATCH /api/announcements/${id}:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = context.params;
  try {
    const { error } = await supabase.from('announcements').delete().eq('announcement_id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`ERROR IN DELETE /api/announcements/${id}:`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}