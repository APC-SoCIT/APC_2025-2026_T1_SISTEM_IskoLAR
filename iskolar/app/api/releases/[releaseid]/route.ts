import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  context: { params: Promise<{ releaseid: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const json = await request.json();
    const { releaseid } = await context.params;

    const updateData: Record<string, unknown> = {
      releasetype: json.releasetype,
      releasedate: json.releasedate,
      releasetime: json.releasetime,
      barangay: json.barangay,
      location: json.location,
      amountperstudent: json.amountperstudent,
      numberofrecipients: json.numberofrecipients,
      additionalnotes: json.additionalnotes
    };

    // Include semester_id if provided (for consistency, though it shouldn't change)
    if (json.semester_id) {
      updateData.semester_id = json.semester_id;
    }

    const { error } = await supabase
      .from('releases')
      .update(updateData)
      .eq('releaseid', releaseid);

    if (error) throw error;

    return NextResponse.json({ message: 'Release updated successfully' });
  } catch (error) {
    console.error('Error updating release:', error);
    return NextResponse.json(
      { error: 'Failed to update release' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ releaseid: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { releaseid } = await context.params;

    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('releaseid', releaseid);

    if (error) throw error;

    return NextResponse.json({ message: 'Release deleted successfully' });
  } catch (error) {
    console.error('Error deleting release:', error);
    return NextResponse.json(
      { error: 'Failed to delete release' },
      { status: 500 }
    );
  }
}