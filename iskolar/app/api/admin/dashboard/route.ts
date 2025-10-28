import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role client to bypass RLS for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Regular client for non-admin operations (kept for compatibility)
const supabase = supabaseAdmin;

export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard API] Starting to fetch dashboard data...');

    // Get time range parameter
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30days';
    
    // Calculate date cutoff based on time range
    let dateCutoff: Date | null = null;
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        dateCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateCutoff = null;
        break;
    }

    console.log('[Dashboard API] Time range:', timeRange, 'Date cutoff:', dateCutoff?.toISOString() || 'none');

    // Fetch total applications count with time filter
    let applicationCountQuery = supabase
      .from('application_details')
      .select('*', { count: 'exact', head: true });
    
    if (dateCutoff) {
      applicationCountQuery = applicationCountQuery.gte('created_at', dateCutoff.toISOString());
    }
    
    const { count: totalApplications, error: appCountError } = await applicationCountQuery;

    if (appCountError) {
      console.error('[Dashboard API] Error fetching application count:', appCountError);
    }

    // Fetch applications by status with time filter
    let statusQuery = supabase
      .from('application_details')
      .select('status');
    
    if (dateCutoff) {
      statusQuery = statusQuery.gte('created_at', dateCutoff.toISOString());
    }
    
    const { data: statusData, error: statusError } = await statusQuery;

    if (statusError) {
      console.error('[Dashboard API] Error fetching status data:', statusError);
    }

    // Count by status
    const applicationsByStatus = {
      pending: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
    };

    if (statusData) {
      statusData.forEach((app) => {
        const status = app.status?.toLowerCase() || 'pending';
        if (status in applicationsByStatus) {
          applicationsByStatus[status as keyof typeof applicationsByStatus]++;
        }
      });
    }

    // Calculate pending (needs review) - includes pending, submitted, and under_review
    const pendingApplications = 
      applicationsByStatus.pending + 
      applicationsByStatus.submitted + 
      applicationsByStatus.under_review;

    // Fetch total users count from users table
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('user_id', { count: 'exact', head: true });

    if (usersError) {
      console.error('[Dashboard API] Error fetching users count:', usersError);
      console.error('[Dashboard API] Users error details:', JSON.stringify(usersError, null, 2));
    }
    
    console.log('[Dashboard API] Total users count:', totalUsers || 0);

    // Fetch recent applications (last 10) with user details
    // Using the same pattern as the applications route
    let recentQuery = supabase
      .from('application_details')
      .select(`
        appdet_id,
        status,
        created_at,
        semester_id,
        user_id,
        users!inner (
          first_name,
          last_name,
          email_address,
          barangay,
          college_university
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (dateCutoff) {
      recentQuery = recentQuery.gte('created_at', dateCutoff.toISOString());
    }
    
    const { data: recentApplications, error: recentError } = await recentQuery;

    if (recentError) {
      console.error('[Dashboard API] Error fetching recent applications:', recentError);
      console.error('[Dashboard API] Error details:', JSON.stringify(recentError, null, 2));
    }

    console.log('[Dashboard API] Recent applications raw data:', recentApplications?.length || 0);

    // Map recent applications to expected format
    const mappedRecentApplications = recentApplications?.map((app) => {
      const userData = Array.isArray(app.users) ? app.users[0] : app.users;

      return {
        id: app.appdet_id,
        user_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
        user_email: userData?.email_address || '',
        status: app.status?.toLowerCase() || 'pending',
        created_at: app.created_at,
        semester_name: 'FIRST', // Will be populated from semester data later
        school_year: new Date().getFullYear(),
        barangay: userData?.barangay || 'N/A',
        school: userData?.college_university || 'N/A',
      };
    }) || [];

    // Fetch aggregated data for charts with time filter
    let aggregateQuery = supabase
      .from('application_details')
      .select(`
        appdet_id,
        created_at,
        users!inner (
          barangay,
          college_university,
          college_course
        )
      `);
    
    if (dateCutoff) {
      aggregateQuery = aggregateQuery.gte('created_at', dateCutoff.toISOString());
    }
    
    const { data: allApplicationsData, error: allAppsError } = await aggregateQuery;

    if (allAppsError) {
      console.error('[Dashboard API] Error fetching all applications data:', allAppsError);
    }

    console.log('[Dashboard API] Fetched applications for aggregation:', allApplicationsData?.length || 0);

    // Aggregate by barangay
    const barangayCounts: Record<string, number> = {};
    const schoolCounts: Record<string, number> = {};
    const courseCounts: Record<string, number> = {};

    allApplicationsData?.forEach((app) => {
      const userData = Array.isArray(app.users) ? app.users[0] : app.users;
      
      if (userData?.barangay) {
        barangayCounts[userData.barangay] = (barangayCounts[userData.barangay] || 0) + 1;
      }
      
      if (userData?.college_university) {
        schoolCounts[userData.college_university] = (schoolCounts[userData.college_university] || 0) + 1;
      }
      
      if (userData?.college_course) {
        courseCounts[userData.college_course] = (courseCounts[userData.college_course] || 0) + 1;
      }
    });

    console.log('[Dashboard API] Barangay counts:', Object.keys(barangayCounts).length, 'unique barangays');
    console.log('[Dashboard API] School counts:', Object.keys(schoolCounts).length, 'unique schools');
    console.log('[Dashboard API] Course counts:', Object.keys(courseCounts).length, 'unique courses');

    // Calculate average processing time for completed applications (approved or rejected)
    let processingTimeQuery = supabase
      .from('application_details')
      .select('created_at, updated_at, status')
      .in('status', ['approved', 'rejected']);
    
    if (dateCutoff) {
      processingTimeQuery = processingTimeQuery.gte('created_at', dateCutoff.toISOString());
    }
    
    const { data: completedApps, error: processingError } = await processingTimeQuery;

    if (processingError) {
      console.error('[Dashboard API] Error fetching processing time data:', processingError);
    }

    let averageProcessingTime = 0;
    
    if (completedApps && completedApps.length > 0) {
      const processingTimes = completedApps
        .filter(app => app.created_at && app.updated_at)
        .map(app => {
          const created = new Date(app.created_at);
          const updated = new Date(app.updated_at);
          const diffTime = Math.abs(updated.getTime() - created.getTime());
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          return diffDays;
        });

      if (processingTimes.length > 0) {
        const totalDays = processingTimes.reduce((sum, days) => sum + days, 0);
        averageProcessingTime = totalDays / processingTimes.length;
      }
    }

    console.log('[Dashboard API] Average processing time:', averageProcessingTime.toFixed(2), 'days');

    // Prepare response data
    const dashboardData = {
      totalApplications: totalApplications || 0,
      pendingApplications: pendingApplications,
      approvedApplications: applicationsByStatus.approved,
      rejectedApplications: applicationsByStatus.rejected + applicationsByStatus.withdrawn,
      totalUsers: totalUsers || 0,
      recentApplications: mappedRecentApplications,
      applicationsByStatus: {
        pending: applicationsByStatus.pending,
        submitted: applicationsByStatus.submitted,
        under_review: applicationsByStatus.under_review,
        approved: applicationsByStatus.approved,
        rejected: applicationsByStatus.rejected,
        withdrawn: applicationsByStatus.withdrawn,
      },
      applicationsBySemester: [], // Can be implemented later if needed
      applicationsByBarangay: barangayCounts,
      applicationsBySchool: schoolCounts,
      applicationsByCourse: courseCounts,
      averageProcessingTime: averageProcessingTime,
    };

    console.log('[Dashboard API] Successfully fetched dashboard data:', {
      totalApplications: dashboardData.totalApplications,
      pendingApplications: dashboardData.pendingApplications,
      recentCount: mappedRecentApplications.length,
      barangays: Object.keys(barangayCounts).length,
      schools: Object.keys(schoolCounts).length,
      courses: Object.keys(courseCounts).length,
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[Dashboard API] Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
