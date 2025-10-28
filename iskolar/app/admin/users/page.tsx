
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';
import { fetchCurrentAdmin } from '@/lib/auth/currentAdmin';
import { canCreateUsers, canEditOrDeleteUsers, canArchiveUsers, type AdminRoleName } from '@/lib/auth/roles';
import BrandedLoader from '@/app/components/ui/BrandedLoader';

// --- TYPE DEFINITIONS ---
type User = {
  user_id: string;
  email_address: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  mobile_number: string;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
  is_active?: boolean;
};

interface UserFilters {
  dateRange: { from: string; to: string; };
  status: 'active' | 'inactive' | 'all';
}
// --- END TYPE DEFINITIONS ---


export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ dateRange: { from: '', to: '' }, status: 'all' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'deactivate' | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Role-based permissions
  const [, setAdminRole] = useState<AdminRoleName | null>(null);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canArchive: false,
  });

  useEffect(() => {
    (async () => {
      const admin = await fetchCurrentAdmin();
      if (admin) {
        const role = admin.role.name;
        setAdminRole(role);
        setPermissions({
          canCreate: canCreateUsers(role),
          canEdit: canEditOrDeleteUsers(role),
          canDelete: canEditOrDeleteUsers(role),
          canArchive: canArchiveUsers(role),
        });
      }
    })();
  }, []);

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
          // Search across name and email
          const searchStr = `${user.first_name} ${user.last_name} ${user.email_address}`.toLowerCase();
          const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
          
          // Date filtering based on last login
          let matchesDate = true;
          if (filters.dateRange.from && filters.dateRange.to) {
              const loginDate = user.last_login ? new Date(user.last_login) : null;
              matchesDate = loginDate ? 
                loginDate >= new Date(filters.dateRange.from) && 
                loginDate <= new Date(filters.dateRange.to) : 
                false;
          }
          
          // Status filtering
          let matchesStatus = true;
          if (filters.status !== 'all') {
            // Since we don't have status in the database, we'll consider all users as active for now
            matchesStatus = filters.status === 'active';
          }
          
          return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a: User, b: User) => {
        const dateA = a.last_login ? new Date(a.last_login).getTime() : 0;
        const dateB = b.last_login ? new Date(b.last_login).getTime() : 0;
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

  

  const handleOpenConfirmModal = (user: User, action: 'delete' | 'deactivate') => {
    setSelectedUser(user);
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleCloseModals = () => {
    setIsConfirmOpen(false);
    setSelectedUser(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !confirmAction) return;
    
    try {
      if (confirmAction === 'delete') {
        const response = await fetch(`/api/users/${selectedUser.user_id}`, { 
          method: 'DELETE' 
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete user');
        }
        
        setNotification({ 
          message: 'User deleted successfully', 
          type: 'success' 
        });
      } else {
        const response = await fetch(`/api/users/${selectedUser.user_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'archive' })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to archive user');
        }
        
        setNotification({ 
          message: 'User archived successfully', 
          type: 'success' 
        });
      }
      
      fetchUsers();
    } catch (error) {
      console.error(`Error ${confirmAction}ing user:`, error);
      setNotification({ 
        message: error instanceof Error ? error.message : `Failed to ${confirmAction} user`, 
        type: 'error' 
      });
    } finally {
      handleCloseModals();
    }
  };

  return (
    <div className="px-6 pb-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage and monitor user accounts.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" 
              disabled={isLoading}
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <span className="px-2.5 py-0.5 text-sm bg-blue-100 text-blue-600 rounded-full">
                {filteredUsers.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterModalOpen(true)} 
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                Filter
              </button>
              {permissions.canCreate && (
                <button
                  onClick={() => window.location.href = '/admin/users/create'}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create User
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isLoading && users.length === 0 ? (
          <div className="px-6 py-12">
            <BrandedLoader title="Loading Scholars" subtitle="Retrieving scholar data…" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.mobile_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {permissions.canArchive && user.is_active !== false && (
                        <button
                          onClick={() => handleOpenConfirmModal(user, 'deactivate')}
                          className="cursor-pointer text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md"
                        >
                          Archive
                        </button>
                      )}
                      {permissions.canEdit && (
                        <button
                          onClick={() => window.location.href = `/admin/users/${user.user_id}/edit`}
                          className="cursor-pointer text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md"
                        >
                          Edit
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button
                          onClick={() => handleOpenConfirmModal(user, 'delete')}
                          className="cursor-pointer text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      )}
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

        {/* Pagination Controls */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                  {filteredUsers.length} results
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded border cursor-pointer
                    ${currentPage === 1 
                      ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {currentPage > 2 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 border border-gray-300 rounded cursor-pointer"
                  >
                    1
                  </button>
                )}
                
                {currentPage > 3 && <span className="text-gray-500">...</span>}
                
                {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center px-3 py-1 text-sm rounded border cursor-pointer
                        ${currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                
                {currentPage < Math.ceil(filteredUsers.length / itemsPerPage) - 2 && 
                  <span className="text-gray-500">...</span>
                }
                
                {currentPage < Math.ceil(filteredUsers.length / itemsPerPage) - 1 && (
                  <button
                    onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / itemsPerPage))}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 border border-gray-300 rounded cursor-pointer"
                  >
                    {Math.ceil(filteredUsers.length / itemsPerPage)}
                  </button>
                )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded border cursor-pointer
                    ${currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)
                      ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
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
      <ConfirmationModal 
        isOpen={isConfirmOpen} 
        onClose={handleCloseModals} 
        onConfirm={handleConfirmAction} 
        action={confirmAction}
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
        <div className="p-6 grow overflow-y-auto space-y-6">
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
                <span className="ml-3 text-sm font-medium text-gray-700">All Users</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="active" 
                  checked={status === 'active'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Active Users</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="inactive" 
                  checked={status === 'inactive'} 
                  onChange={(e) => setStatus(e.target.value as UserFilters["status"])} 
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Inactive Users</span>
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


function ConfirmationModal({ isOpen, onClose, onConfirm, action }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  action: 'delete' | 'deactivate' | null;
}) { 
  if (!isOpen) return null; 
  
  const isDelete = action === 'delete';
  const message = isDelete
    ? 'Are you sure you want to permanently delete this user? This action cannot be undone.'
    : 'Are you sure you want to deactivate this user? They will no longer be able to access their account.';
    
  return (
    <div className="fixed inset-0 bg-gray-500/50 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isDelete ? 'Confirm Deletion' : 'Confirm Deactivation'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`cursor-pointer px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
              isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isDelete ? 'Delete' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  ); 
}