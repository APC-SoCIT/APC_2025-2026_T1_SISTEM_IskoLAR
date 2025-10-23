"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---
type User = {
  user_id: string;
  email_address?: string;
  first_name: string;
  last_name: string;
  barangay?: string;
  school?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
};

interface UserFilters {
  dateRange: { from: string; to: string; };
  status: 'Pending' | 'Approved' | 'Rejected' | 'all';
}
// --- END TYPE DEFINITIONS ---


export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ dateRange: { from: '', to: '' }, status: 'all' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  


  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => { 
    setIsLoading(true); 
    try { 
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      setUsers(data); 
    } catch (error) { 
      console.error('Error fetching users:', error); 
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to fetch users', 
        type: 'error' 
      }); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { 
    if (notification) { 
      const timer = setTimeout(() => { setNotification(null); }, 3000); 
      return () => clearTimeout(timer); 
    } 
  }, [notification]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user: User) => {
          // Search across name
          const searchStr = `${user.first_name} ${user.last_name}`.toLowerCase();
          const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
          
          // Date filtering based on creation date
          let matchesDate = true;
          if (filters.dateRange.from && filters.dateRange.to) {
              const createdDate = new Date(user.created_at);
              matchesDate = createdDate >= new Date(filters.dateRange.from) && 
                           createdDate <= new Date(filters.dateRange.to);
          }
          
          // Status filtering
          let matchesStatus = true;
          if (filters.status !== 'all') {
            matchesStatus = user.status === filters.status;
          }
          
          return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a: User, b: User) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
  }, [users, searchQuery, filters]);

  const handleApplyFilters = (newFilters: UserFilters) => { 
    setFilters(newFilters); 
    setIsFilterModalOpen(false); 
  };
  
  const handleResetFilters = () => { 
    setFilters({ dateRange: { from: '', to: '' }, status: 'all' }); 
    setIsFilterModalOpen(false); 
  };

  



  return (
    <div className="px-10 pt-8 pb-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">Scholarship Applications</h1>
          <p className="text-sm text-gray-500">View and manage scholarship applications.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" 
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
              <span className="px-2.5 py-0.5 text-sm bg-blue-100 text-blue-600 rounded-full">
                {filteredUsers.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(true)} 
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barangay
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email_address || 'No email provided'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Western Bicutan</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Asia Pacific College</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                   bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/admin/applications/${user.user_id}`}
                        className="cursor-pointer text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Users Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <UserFilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={handleApplyFilters} 
        onReset={handleResetFilters} 
        initialFilters={filters} 
      />
    </div>
  );
}

// --- MODAL COMPONENTS ---
interface UserFilterModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onApply: (filters: UserFilters) => void; 
  onReset: () => void; 
  initialFilters: UserFilters; 
}

function UserFilterModal({ isOpen, onClose, onApply, onReset, initialFilters }: UserFilterModalProps) {
  const [dateRange, setDateRange] = useState(initialFilters.dateRange);
  const [status, setStatus] = useState(initialFilters.status);
  
  useEffect(() => { 
    setDateRange(initialFilters.dateRange); 
    setStatus(initialFilters.status);
  }, [isOpen, initialFilters]);

  const handleApply = () => { 
    onApply({ dateRange, status }); 
  };
  
  const handleLocalReset = () => { 
    setDateRange({ from: '', to: '' }); 
    setStatus('all'); 
    onReset(); 
  };
  
  const handleDateShortcut = (days: number) => { 
    const to = new Date(); 
    const from = new Date(); 
    from.setDate(from.getDate() - days); 
    setDateRange({ 
      from: from.toISOString().split('T')[0], 
      to: to.toISOString().split('T')[0] 
    }); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Filter Users</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Last Login Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-100">
              <button onClick={() => handleDateShortcut(7)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 7 days
              </button>
              <span className="text-gray-300 self-center">•</span>
              <button onClick={() => handleDateShortcut(30)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer">
                Last 30 days
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">User Status</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="all" 
                  checked={status === 'all'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">All Applications</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="Pending" 
                  checked={status === 'Pending'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Pending Applications</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="Approved" 
                  checked={status === 'Approved'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Approved Applications</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="Rejected" 
                  checked={status === 'Rejected'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Rejected Applications</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            Reset Filters
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleApply} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}


