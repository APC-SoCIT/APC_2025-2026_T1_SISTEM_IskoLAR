import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    let query = supabase
      .from('releases')
      .select('*')
      .order('releasedate', { ascending: true });

    // Filter by semester if semesterId is provided
    if (semesterId) {
      query = query.eq('semester_id', semesterId);
    }

    const { data: releases, error } = await query;

    if (error) throw error;

    return NextResponse.json(releases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const json = await request.json();

    // Validate that semester_id is provided
    if (!json.semester_id) {
      return NextResponse.json(
        { error: 'semester_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('releases')
      .insert([{
        releasetype: json.releasetype,
        releasedate: json.releasedate,
        releasetime: json.releasetime,
        barangay: json.barangay,
        location: json.location,
        amountperstudent: json.amountperstudent,
        numberofrecipients: json.numberofrecipients,
        additionalnotes: json.additionalnotes,
        semester_id: json.semester_id
      }]);

    if (error) throw error;

    return NextResponse.json({ message: 'Release created successfully' });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json(
      { error: 'Failed to create release' },
      { status: 500 }
    );
  }
}