'use client';

import React from 'react';
import { 
  Search, 
  Moon, 
  Bell, 
  ChevronDown,
  UserCircle
} from 'lucide-react';

export default function AdminTopNav() {
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Page Label */}
          <h1 className="text-xl font-semibold text-gray-900">
            Applications & Verification
          </h1>

          {/* Right side - Search, Actions, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
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
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCircle className="h-8 w-8 text-gray-700" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
