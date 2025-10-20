import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { applications_open } = body;

    const { data, error } = await supabaseAdmin
      .from('semesters')
      .update({ applications_open })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating semester:', error);
      return NextResponse.json(
        { error: 'Failed to update semester' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in semester PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the admin password
    const { adminPassword } = await request.json();
    
    // In a real application, you would validate the admin password against a secure hash
    // For now, we'll use a simple check (REPLACE THIS WITH PROPER VALIDATION)
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 403 }
      );
    }

    // First delete all applications for this semester
    await supabaseAdmin
      .from('applications')
      .delete()
      .eq('semester_id', id);

    // Then delete the semester
    const { error } = await supabaseAdmin
      .from('semesters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting semester:', error);
      return NextResponse.json(
        { error: 'Failed to delete semester' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in semester DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}