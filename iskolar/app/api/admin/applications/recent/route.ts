import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch the 10 most recent applications
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent applications' },
        { status: 500 }
      );
    }

    // For now, just return the basic application data since there are no applications yet
    const formattedApplications = (applications || []).map((app: any) => ({
      id: app.id,
      status: app.status || 'pending',
      date: app.created_at,
    }));

    return NextResponse.json(formattedApplications);
  } catch (error) {
    console.error('Error in recent applications GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: Since this is read-only endpoint, we only implement GET