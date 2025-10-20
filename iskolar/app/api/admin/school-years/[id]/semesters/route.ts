import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { id: string };

export async function POST(
  request: Request,
  context: { params: Params }
) {
  try {
    const id = context.params.id;
    console.log('Creating semester for school year:', id);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, start_date, end_date, applications_open = false } = body;

    // Validate the request body
    if (!name || !start_date || !end_date) {
      console.log('Missing required fields:', { name, start_date, end_date });
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate that the school year exists
    console.log('Checking school year existence...');
    const { data: schoolYear, error: yearError } = await supabaseAdmin
      .from('school_years')
      .select()
      .eq('id', id)
      .single();

    if (yearError) {
      console.error('Error fetching school year:', yearError);
      return NextResponse.json(
        { error: `School year not found: ${yearError.message}` },
        { status: 404 }
      );
    }

    if (!schoolYear) {
      console.error('School year not found for ID:', id);
      return NextResponse.json(
        { error: 'School year not found' },
        { status: 404 }
      );
    }

    // Validate dates
    console.log('Validating dates...');
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      console.log('Invalid dates:', { start_date, end_date });
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create new semester
    console.log('Attempting to create semester...', {
      school_year_id: id,
      name,
      start_date,
      end_date,
      applications_open
    });

    const { data, error } = await supabaseAdmin
      .from('semesters')
      .insert([
        {
          school_year_id: id,
          name,
          start_date,
          end_date,
          applications_open
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error creating semester:', error);
      return NextResponse.json(
        { error: `Failed to create semester: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Semester created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in semesters POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}