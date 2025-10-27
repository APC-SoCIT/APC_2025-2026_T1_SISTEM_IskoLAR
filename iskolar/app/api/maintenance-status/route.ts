import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/maintenance-status - Public endpoint to check maintenance mode
export async function GET() {
  try {
    // Fetch maintenance settings from database
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .eq('key', 'maintenance')
      .single();

    if (error) {
      // If table doesn't exist or no maintenance setting, return default (not in maintenance)
      if (error.code === 'PGRST116' || error.code === 'PGRST204') {
        return NextResponse.json({
          maintenanceMode: false,
          maintenanceMessage: 'System is under maintenance. Please check back later.',
          estimatedEnd: null,
        });
      }
      throw error;
    }

    // Extract maintenance settings from JSONB value
    const maintenanceSettings = data?.value || {};
    
    return NextResponse.json({
      maintenanceMode: maintenanceSettings.maintenanceMode || false,
      maintenanceMessage: maintenanceSettings.maintenanceMessage || 'System is under maintenance. Please check back later.',
      estimatedEnd: maintenanceSettings.estimatedEnd || null,
    });
  } catch (error) {
    console.error('[GET /api/maintenance-status] Error:', error);
    
    // On error, default to not in maintenance (fail open)
    return NextResponse.json({
      maintenanceMode: false,
      maintenanceMessage: 'System is under maintenance. Please check back later.',
      estimatedEnd: null,
    });
  }
}
