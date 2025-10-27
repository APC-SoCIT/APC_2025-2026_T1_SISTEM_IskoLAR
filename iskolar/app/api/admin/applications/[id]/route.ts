import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch application details with user info and documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params; // The [id] in the URL is the userId
    const searchParams = request.nextUrl.searchParams;
    const semesterId = searchParams.get('semesterId');

    if (!semesterId) {
      return NextResponse.json(
        { error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    // Fetch user information
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user information', details: userError.message },
        { status: 500 }
      );
    }

    // Fetch application details
    const { data: appData, error: appError } = await supabaseAdmin
      .from('application_details')
      .select('*')
      .eq('user_id', userId)
      .eq('semester_id', semesterId)
      .single();

    if (appError) {
      console.error('Error fetching application:', appError);
      return NextResponse.json(
        { error: 'Failed to fetch application details', details: appError.message },
        { status: 500 }
      );
    }

    // Fetch documents
    const { data: docsData, error: docsError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      // Don't fail if documents fetch fails, just return empty array
      return NextResponse.json({
        user: userData,
        application: appData,
        documents: []
      });
    }

    return NextResponse.json({
      user: userData,
      application: appData,
      documents: docsData || []
    });
  } catch (error) {
    console.error('Error in GET application detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    // Update the application status
    const { data, error } = await supabaseAdmin
      .from('application_details')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('appdet_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: `Application ${status} successfully`,
      application: data 
    });
  } catch (error) {
    console.error('Error in PATCH applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the application
    const { data, error } = await supabaseAdmin
      .from('application_details')
      .delete()
      .eq('appdet_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Application deleted successfully',
      application: data 
    });
  } catch (error) {
    console.error('Error in DELETE applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}