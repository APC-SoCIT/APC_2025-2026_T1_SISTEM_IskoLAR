import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type ArchiveResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

type Context = {
  params: Promise<{
    releaseid: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: Context
): Promise<NextResponse<ArchiveResponse>> {
  const params = await context.params;
  
  if (!params.releaseid) {
    return NextResponse.json(
      { success: false, error: 'Release ID is required' },
      { status: 400 }
    );
  }

  try {
    const { isArchived } = await request.json();

    // Create a new supabase client for each request
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    });

    // Check if release exists first
    const { data: existingRelease, error: fetchError } = await supabase
      .from('releases')
      .select('releaseid')
      .eq('releaseid', params.releaseid)
      .single();

    if (fetchError || !existingRelease) {
      return NextResponse.json(
        { success: false, error: 'Release not found' },
        { status: 404 }
      );
    }

    // Update the release archive status
    const { error: updateError } = await supabase
      .from('releases')
      .update({ isArchived })
      .eq('releaseid', params.releaseid);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update release status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Release ${isArchived ? 'archived' : 'unarchived'} successfully`
    });

  } catch (error) {
    console.error('Error in archive route:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error while updating release' 
    }, { 
      status: 500 
    });
  }
}