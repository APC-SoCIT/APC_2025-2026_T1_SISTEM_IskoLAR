'use client';

import { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function MaintenanceBanner() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedEnd, setEstimatedEnd] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
    fetchMaintenanceSettings();
  }, []);

  // Check if current user is a super admin
  const checkUserRole = async () => {
    try {
      const supabase = supabaseBrowser();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('🔍 Checking user role...', { user: user?.id, userError });
      
      if (!user) {
        console.log('❌ No user found');
        setIsSuperAdmin(false);
        return;
      }

      // Check if user exists in admin table with super_admin role
      // Admin table uses: admin_id (PK), email_address, role_id (FK to role.role_id)
      // Note: admin_id is NOT the same as auth.users.id, so we match by email
      const { data: admin, error: adminError } = await supabase
        .from('admin')
        .select('admin_id, email_address, role_id, role:role!role_id(role_id, name)')
        .eq('email_address', user.email)
        .single();

      console.log('👤 Admin data:', { admin, adminError, role: admin?.role, userEmail: user.email });
      
      // User is super admin if they're in admin table and their role name is 'super_admin'
      // The role might be an object or array depending on the query
      const roleName = Array.isArray(admin?.role) ? admin?.role[0]?.name : (admin?.role as any)?.name;
      const isSuperAdminRole = roleName === 'super_admin';
      console.log('✅ Is Super Admin:', isSuperAdminRole, '| Role Name:', roleName);
      
      setIsSuperAdmin(isSuperAdminRole);
    } catch (error) {
      console.error('❌ Failed to check user role:', error);
      setIsSuperAdmin(false);
    }
  };

  // Update countdown timer every second
  useEffect(() => {
    if (!estimatedEnd) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(estimatedEnd).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining('Completing soon...');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer(); // Update immediately
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [estimatedEnd]);

  const fetchMaintenanceSettings = async () => {
    try {
      const response = await fetch('/api/maintenance-status');
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceMessage(data.maintenanceMessage || 'System is under maintenance. Please check back later.');
        setEstimatedEnd(data.estimatedEnd || null);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if:
  // - Still loading
  // - Maintenance mode is off
  // - User is a super admin (they need access to turn it off)
  console.log('🎯 MaintenanceBanner render check:', { 
    isLoading, 
    maintenanceMode, 
    isSuperAdmin,
    shouldShow: !isLoading && maintenanceMode && !isSuperAdmin
  });
  
  if (isLoading || !maintenanceMode || isSuperAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center p-4">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #ff6b35 0px,
            #ff6b35 10px,
            transparent 10px,
            transparent 20px
          )`
        }}></div>
      </div>

      {/* Main content */}
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Animated wrench icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-6 animate-bounce">
              <WrenchScrewdriverIcon className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
          {maintenanceMessage}
        </p>

        {/* Countdown Timer */}
        {estimatedEnd && timeRemaining && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-6">
            <p className="text-white text-sm font-medium mb-2">ESTIMATED TIME REMAINING</p>
            <div className="text-5xl md:text-6xl font-bold text-white font-mono tracking-wider">
              {timeRemaining}
            </div>
          </div>
        )}

        {/* Expected completion time */}
        {estimatedEnd && (
          <p className="text-gray-600 mb-6">
            Expected completion: <span className="font-semibold text-gray-900">
              {new Date(estimatedEnd).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </p>
        )}

        {/* Info text */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <p className="text-gray-500 text-sm">
            We apologize for the inconvenience. Our team is working hard to improve your experience.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please refresh this page in a few moments to check if we&apos;re back online.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Check Status
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-gray-600 text-sm">
          IskoLAR Scholarship System
        </p>
      </div>
    </div>
  );
}
