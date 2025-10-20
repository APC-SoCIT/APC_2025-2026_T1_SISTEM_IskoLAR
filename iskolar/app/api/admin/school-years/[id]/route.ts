import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string }}
) {
  try {
    const { id } = params;

    const { data: schoolYear, error } = await supabaseAdmin
      .from('school_years')
      .select(`
        *,
        semesters (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching school year:', error);
      return NextResponse.json(
        { error: 'Failed to fetch school year' },
        { status: 500 }
      );
    }

    if (!schoolYear) {
      return NextResponse.json(
        { error: 'School year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schoolYear);
  } catch (error) {
    console.error('Error in school year GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}