
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/useAuth';
import { useEffect, useState } from 'react';
import { fetchCurrentAdmin } from '@/lib/auth/currentAdmin';
import { roleDisplay, roleSubtitle, canManageAdmins } from '@/lib/auth/roles';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [title, setTitle] = useState('Administrator');
  const [subtitle, setSubtitle] = useState('Application Management');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const admin = await fetchCurrentAdmin();
        if (!mounted) return;
        
        if (!admin) {
          console.warn('AdminSidebar: fetchCurrentAdmin returned null');
          setLoading(false);
          return;
        }
        
        console.log('AdminSidebar: admin data received:', admin);
        const roleName = admin.role.name;
        const newTitle = roleDisplay(roleName);
        const newSubtitle = roleSubtitle(roleName);
        
        console.log('AdminSidebar: setting title to:', newTitle, 'subtitle:', newSubtitle);
        
        setTitle(newTitle);
        setSubtitle(newSubtitle);
        setIsSuperAdmin(canManageAdmins(roleName));
        setLoading(false);
      } catch (error) {
        console.error('AdminSidebar: error in useEffect:', error);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const handleSignOut = async () => {
    try {
      console.log('Admin signing out...');
      await signOut();
      console.log('Admin sign out successful, redirecting...');
      // Redirect to admin sign in page after successful sign out
      router.push('/admin-auth/signin');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Manual fallback redirect if needed
      router.push('/admin-auth/signin');
    }
  };

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3zM14 12a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7z"
          />
        </svg>
      ),
    },
    {
      label: 'Applications',
      href: '/admin/applications',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const adminNavItems = [
    {
      label: 'Announcements',
      href: '/admin/announcements',
      icon: (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M15 7.2322H13.9002M2.53555 7.2322H3.63535M8.76777 0.999969V2.09977M4.36086 2.82565L5.13805 3.60357M13.1743 2.82565L12.3964 3.60357M9.24839 4.82252C6.01533 7.64462 2.53445 11.1941 1.2979 12.4735C1.00828 12.773 0.915901 13.2096 1.08271 13.5909C1.17362 13.798 1.28104 14.0242 1.39212 14.2167C1.5032 14.4092 1.64544 14.6152 1.77961 14.7974C2.02597 15.1328 2.4505 15.2707 2.85449 15.1699C4.58082 14.7384 9.39539 13.4989 13.4559 12.1102" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M7.34242 6.56976C7.34242 6.56976 8.10898 7.33669 9.40859 9.58763C10.7082 11.8386 10.989 12.8859 10.989 12.8859M7.73981 13.9619L7.95758 14.775C8.01477 14.9886 8.02935 15.2112 8.00048 15.4304C7.97161 15.6495 7.89986 15.8609 7.78933 16.0523C7.67879 16.2437 7.53164 16.4115 7.35627 16.546C7.18089 16.6806 6.98073 16.7792 6.76722 16.8364C6.55371 16.8936 6.33102 16.9082 6.11187 16.8793C5.89272 16.8505 5.68141 16.7787 5.48999 16.6682C5.29857 16.5577 5.1308 16.4105 4.99625 16.2351C4.8617 16.0598 4.76301 15.8596 4.70582 15.6461L4.52472 14.9686M8.96793 4.33606C8.96793 4.33606 9.84668 5.29692 11.595 8.32542C13.3433 11.3539 13.7363 12.5952 13.7363 12.5952" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label:'Users',
      href: '/admin/users',
      icon: (
        <svg width="20" height="16" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          />
        </svg>
      ),
    },
  ];

  // Super admin only navigation items
  const superAdminNavItems = isSuperAdmin ? [
    {
      label: 'Administrators',
      href: '/admin/admin-management',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      label: 'System Settings',
      href: '/admin/settings',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ] : [];

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-64 font-geist flex flex-col border-r bg-white border-gray-300 text-sm shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">
      {/* Logo Header */}
      <div className="p-4 pl-7 border-b flex items-center gap-2 border-gray-300">
        <Image
          src="/IskoLAR.png"
          alt="IskoLAR logo"
          width={28}
          height={28}
          className="transition-all duration-300"
        />
        <span className="text-base font-semibold">IskoLAR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {/* Main Section */}
        <div className="py-2 px-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Main</span>
        </div>

        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50/80'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                }`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Administration Section */}
        <div className="py-2 px-3 mt-6">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Administration</span>
        </div>

        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.label}>
              <div
                className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50/80'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                }`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Super Admin Only Section */}
        {isSuperAdmin && (
          <>
            <div className="py-2 px-3 mt-6">
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Super Admin</span>
            </div>
            
            {superAdminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link href={item.href} key={item.label}>
                  <div
                    className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-purple-600 hover:bg-purple-50/80'
                    }`}
                  >
                    <span className={`transition-colors duration-200 ${isActive ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-600'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-purple-600' : 'text-purple-700 group-hover:text-purple-900'
                    }`}>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />
                    )}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Administrator Profile and Sign Out */}
      <div className="mt-auto border-t border-gray-200">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {loading ? '...' : title}
              </div>
              <div className="text-sm text-gray-500">
                {loading ? '' : subtitle}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-100 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;