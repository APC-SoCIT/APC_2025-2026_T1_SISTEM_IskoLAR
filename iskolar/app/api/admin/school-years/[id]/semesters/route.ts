import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, applications_open = false } = body;

    // Validate that the school year exists
    const { data: schoolYear, error: yearError } = await supabaseAdmin
      .from('school_years')
      .select()
      .eq('id', id)
      .single();

    if (yearError || !schoolYear) {
      return NextResponse.json(
        { error: 'School year not found' },
        { status: 404 }
      );
    }

    // Create new semester
    const { data, error } = await supabaseAdmin
      .from('semesters')
      .insert([
        {
          school_year_id: id,
          name,
          applications_open
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating semester:', error);
      return NextResponse.json(
        { error: 'Failed to create semester' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in semesters POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}