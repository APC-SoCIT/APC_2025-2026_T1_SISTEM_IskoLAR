'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Moon, 
  Bell, 
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  User
} from 'lucide-react';

export default function DisbursementScheduleTopNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Page Label */}
          <h1 className="text-xl font-semibold text-gray-900">
            Disbursement Schedule
          </h1>

          {/* Right side - Search, Actions, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search schedules..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Action Icons */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Moon className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <UserCircle className="h-8 w-8 text-gray-700" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    onClick={() => {/* Add logout logic */}}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
