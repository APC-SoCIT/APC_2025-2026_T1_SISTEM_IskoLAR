"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UserMinusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

// --- TYPE DEFINITIONS & MOCK DATA (As per your code) ---
type UserRole = 'Admin' | 'User';
type UserStatus = 'Approved' | 'Pending' | 'Rejected';
type ActivityLog = { id: string; action: string; timestamp: string; details: string; };
type User = { 
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email_address: string;
  mobile_number: string;
  gender: string;
  birthdate: string;
  present_address?: string | null;
  permanent_address?: string | null;
  college_university?: string | null;
  course?: string | null;
  role_id: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  activityLog?: ActivityLog[];
};
interface UserFilters {
  selectedRoles: UserRole[];
  selectedStatuses: UserStatus[];
  lastLogin: 'all' | '2months' | '3months';
}
// --- END MOCK DATA ---

const UserPill = ({ type, value }: { type: 'role' | 'status', value: UserRole | UserStatus | string }) => {
  const configs = {
    role: { Admin: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }, User: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }, },
    status: { Approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }, Pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }, Rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }, }
  };
  const defaultConfig = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const config = (type === 'role' ? configs.role[value as UserRole] : type === 'status' ? configs.status[value as UserStatus] : undefined) || defaultConfig;
  const getDotColor = () => { if (type === 'status') { switch (value) { case 'Approved': return 'bg-green-500'; case 'Pending': return 'bg-yellow-500'; case 'Rejected': return 'bg-red-500'; default: return 'bg-gray-500'; } } else if (type === 'role') { switch (value) { case 'Admin': return 'bg-blue-500'; case 'User': return 'bg-purple-500'; default: return 'bg-gray-500'; } } return 'bg-gray-500'; };
  return (<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${getDotColor()}`}></span>{value || 'N/A'}</span>);
};

const formatLastLogin = (dateString?: string | null) => {
  if (!dateString) return <span className="text-gray-400">Never</span>;
  const lastLogin = new Date(dateString); const now = new Date(); const diffInMs = now.getTime() - lastLogin.getTime(); const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); const diffInMonths = (now.getFullYear() - lastLogin.getFullYear()) * 12 + (now.getMonth() - lastLogin.getMonth());
  let text = ''; let color = '';
  if (diffInMonths < 2) { if (diffInDays <= 0) text = 'Today'; else if (diffInDays === 1) text = 'Yesterday'; else text = `${diffInDays} days ago`; color = 'text-green-600'; }
  else if (diffInMonths < 3) { text = 'Over 2 months ago'; color = 'text-green-600'; }
  else { text = `Over 3 months ago`; color = 'text-red-600'; }
  return <span className={`font-medium ${color}`}>{text}</span>;
};

const getFullName = (user: User) => {
  return `${user.first_name}${user.middle_name ? ` ${user.middle_name}` : ''} ${user.last_name}`;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ selectedRoles: [], selectedStatuses: [], lastLogin: 'all', });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'delete' | 'deactivate-bulk' | 'delete-bulk' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      const transformedData = data.map((user: User) => ({ ...user, status: 'Pending' as UserStatus, activityLog: [] }));
      setUsers(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotification({ message: 'Failed to fetch users.', type: 'error' });
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
    const now = new Date();
    return users
      .filter(user => {
        const fullName = getFullName(user);
        const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) || user.email_address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filters.selectedRoles.length === 0 || filters.selectedRoles.includes(user.role);
        const matchesStatus = filters.selectedStatuses.length === 0 || filters.selectedStatuses.includes(user.status);
        let matchesLastLogin = true;
        if(filters.lastLogin !== 'all' && user.last_login) {
            const lastLoginDate = new Date(user.last_login);
            const diffInMonths = (now.getFullYear() - lastLoginDate.getFullYear()) * 12 + (now.getMonth() - lastLoginDate.getMonth());
            if(filters.lastLogin === '2months') matchesLastLogin = diffInMonths < 2;
            if(filters.lastLogin === '3months') matchesLastLogin = diffInMonths >= 3;
        } else if (filters.lastLogin !== 'all' && !user.last_login) {
            matchesLastLogin = filters.lastLogin === '3months';
        }
        return matchesSearch && matchesRole && matchesStatus && matchesLastLogin;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [users, searchQuery, filters]);

  const userCounts = useMemo(() => ({
      roles: { Admin: users.filter(u => u.role === 'Admin').length, User: users.filter(u => u.role === 'User').length },
      statuses: { Approved: users.filter(u => u.status === 'Approved').length, Pending: users.filter(u => u.status === 'Pending').length, Rejected: users.filter(u => u.status === 'Rejected').length, }
  }), [users]);
  
  const handleApplyFilters = (newFilters: UserFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); };
  const handleResetFilters = () => { setFilters({ selectedRoles: [], selectedStatuses: [], lastLogin: 'all' }); setIsFilterModalOpen(false); };
  
  const activeFilterCount = filters.selectedRoles.length + filters.selectedStatuses.length + (filters.lastLogin !== 'all' ? 1 : 0);
  const handleSelectUser = (userId: string) => { setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) { setSelectedUserIds(filteredUsers.map(u => u.user_id)); } else { setSelectedUserIds([]); } };
  const handleOpenBulkConfirm = (action: 'deactivate-bulk' | 'delete-bulk') => { setConfirmAction(action); setIsConfirmModalOpen(true); };
  const handleOpenDetails = (user: User) => { setSelectedUser(user); setIsDetailsModalOpen(true); };
  const handleOpenConfirm = (user: User, action: 'deactivate' | 'delete') => { setSelectedUser(user); setConfirmAction(action); setIsConfirmModalOpen(true); };
  const handleCloseModals = () => { setIsDetailsModalOpen(false); setIsConfirmModalOpen(false); setSelectedUser(null); setConfirmAction(null); };
  
  const handleConfirmAction = async () => {
    const isBulk = confirmAction?.includes('bulk');
    const action = confirmAction?.replace('-bulk', '');
    const userIds = isBulk ? selectedUserIds : (selectedUser ? [selectedUser.user_id] : []);

    let success = true;

    for (const id of userIds) {
        try {
            if (action === 'delete') {
                const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
                // This check is important
                if (!response.ok) {
                  success = false;
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to delete user');
                }
            }
            if (action === 'deactivate') {
                const response = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Inactive' }) });
                if (!response.ok) {
                  success = false;
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to deactivate user');
                }
            }
        } catch(error) {
            success = false;
            console.error(error);
            setNotification({ message: (error as Error).message, type: 'error' });
            break; // Stop on the first error
        }
    }
    
    if (success) {
      setNotification({ message: `${userIds.length} user(s) ${action}d successfully.`, type: 'success' });
      fetchUsers(); // Only refresh if successful
    }

    setSelectedUserIds([]); 
    handleCloseModals(); 
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {notification && (<div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{notification.message}</div>)}
      
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-1"><h1 className="text-2xl font-semibold text-gray-900">IskoLAR User Management</h1><p className="text-sm text-gray-500">Monitor, deactivate, or delete user accounts.</p></div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input type="text" placeholder="Search users by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
          </div>
          <button onClick={() => setIsFilterModalOpen(true)} className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            Filter
            {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{activeFilterCount}</span>}
          </button>
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="absolute top-1.5 right-1.5 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span></button>
          <div className="relative group">
            <button className="flex items-center gap-3 group"><div className="flex flex-col items-end"><span className="text-sm font-medium text-gray-900">Admin User</span><span className="text-xs text-gray-500">administrator</span></div><div className="flex items-center gap-2"><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">AU</div><svg className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div></button>
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 invisible opacity-0 translate-y-1 transition-all duration-200 ease-in-out z-50 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0"><div className="py-1"><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>View Profile</Link><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.5 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</Link><hr className="my-1 border-gray-200" /><button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Sign out</button></div></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Registered Users ({filteredUsers.length})</h2></div>
        {selectedUserIds.length > 0 && (<div className="px-6 py-3 bg-blue-50 border-b border-blue-200"><div className="flex items-center justify-between"><span className="text-sm font-medium text-blue-800">{selectedUserIds.length} user(s) selected</span><div className="space-x-2"><button onClick={() => handleOpenBulkConfirm('deactivate-bulk')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><UserMinusIcon className="h-4 w-4"/>Deactivate</button><button onClick={() => handleOpenBulkConfirm('delete-bulk')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"><TrashIcon className="h-4 w-4"/>Delete</button></div></div></div>)}
        
        {isLoading ? (<div className="p-6 text-center text-gray-500">Loading users...</div>) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" onChange={handleSelectAll} checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length} ref={input => { if (input) { input.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length; } }}/></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.user_id} className={`group transition-colors duration-150 ${selectedUserIds.includes(user.user_id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" checked={selectedUserIds.includes(user.user_id)} onChange={() => handleSelectUser(user.user_id)} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0"><div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center"><span className="text-blue-600 font-medium text-sm">{user.first_name.charAt(0)}</span></div></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{getFullName(user)}</div><div className="text-sm text-gray-500">{user.email_address}</div></div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><UserPill type="role" value={user.role} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><UserPill type="status" value={user.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatLastLogin(user.last_login)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-2"><button onClick={() => handleOpenDetails(user)} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700" title="View Details"><EyeIcon className="h-4 w-4" /></button><button onClick={() => handleOpenConfirm(user, 'deactivate')} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-yellow-500 rounded-lg shadow-sm hover:bg-yellow-600" title="Deactivate User"><UserMinusIcon className="h-4 w-4" /></button><button onClick={() => handleOpenConfirm(user, 'delete')} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700" title="Delete User"><TrashIcon className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (<div className="text-center p-10"><UserMinusIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">No Users Found</h3><p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p></div>)}
      </div>
      
      <UserFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} onReset={handleResetFilters} initialFilters={filters} counts={userCounts} />
      <UserDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseModals} user={selectedUser} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseModals} onConfirm={handleConfirmAction} action={confirmAction} selectedCount={selectedUserIds.length} userName={selectedUser ? getFullName(selectedUser) : ''} />
    </div>
  );
}

interface UserFilterModalProps {
  isOpen: boolean; onClose: () => void; onApply: (filters: UserFilters) => void; onReset: () => void; initialFilters: UserFilters; counts: { roles: Record<UserRole, number>; statuses: Record<UserStatus, number>; };
}
function UserFilterModal({ isOpen, onClose, onApply, onReset, initialFilters, counts }: UserFilterModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(initialFilters.selectedRoles);
  const [selectedStatuses, setSelectedStatuses] = useState<UserStatus[]>(initialFilters.selectedStatuses);
  const [lastLogin, setLastLogin] = useState(initialFilters.lastLogin);
  
  useEffect(() => {
    setSelectedRoles(initialFilters.selectedRoles);
    setSelectedStatuses(initialFilters.selectedStatuses);
    setLastLogin(initialFilters.lastLogin);
  }, [isOpen, initialFilters]);

  const handleApply = () => { onApply({ selectedRoles, selectedStatuses, lastLogin }); };
  const handleLocalReset = () => { setSelectedRoles([]); setSelectedStatuses([]); setLastLogin('all'); onReset(); };

  if (!isOpen) return null;

  const toggleCheckbox = <T extends string>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, value: T) => { setList((current: T[]) => current.includes(value) ? current.filter(item => item !== value) : [...current, value]); };

  return (
    <div className="fixed inset-0 bg-black/25 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b pb-4"><h3 className="text-xl font-semibold text-gray-900">Filter Users</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <div className="space-y-2">
              {(['Admin', 'User'] as UserRole[]).map(role => {
                const roleColors = { Admin: 'bg-blue-50 text-blue-700 border-blue-200', User: 'bg-purple-50 text-purple-700 border-purple-200' };
                return (<label key={role} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><div className="flex items-center justify-start w-full"><input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleCheckbox(selectedRoles, setSelectedRoles, role)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 flex-shrink-0 mr-3"/><span className="text-sm font-medium text-gray-900">{role}</span></div><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[role]}`}>{counts.roles[role]}</span></label>);
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <div className="space-y-2">
              {(['Approved', 'Pending', 'Rejected'] as UserStatus[]).map(status => {
                const statusColors = { Approved: 'bg-green-50 text-green-700 border-green-200', Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200', Rejected: 'bg-red-50 text-red-700 border-red-200' };
                return (<label key={status} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><div className="flex items-center justify-start w-full"><input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleCheckbox(selectedStatuses, setSelectedStatuses, status)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 flex-shrink-0 mr-3"/><span className="text-sm font-medium text-gray-900">{status}</span></div><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}>{counts.statuses[status]}</span></label>);
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Login Activity</label>
            <select value={lastLogin} onChange={(e) => setLastLogin(e.target.value as 'all' | '2months' | '3months')} className="w-full px-3 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="all">Anytime</option>
              <option value="2months">Within last 2 months</option>
              <option value="3months">Over 3 months ago</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">Reset</button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

function UserDetailsModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User | null }) { 
  if (!isOpen || !user) return null; 
  return (
    <div className="fixed inset-0 bg-black/25 overflow-y-auto flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">User Account Details</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">&times;</button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div><h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3><div className="text-sm space-y-1"><p><strong>Full Name:</strong> {getFullName(user)}</p><p><strong>Email:</strong> {user.email_address}</p><p><strong>Mobile Number:</strong> {user.mobile_number}</p><p><strong>Gender:</strong> {user.gender}</p><p><strong>Birthdate:</strong> {new Date(user.birthdate).toLocaleDateString()}</p><p><strong>Role:</strong> {user.role}</p><p><strong>Status:</strong> {user.status}</p></div></div>
          {(user.present_address || user.permanent_address) && (<div><h3 className="font-semibold text-gray-800 mb-2">Address Information</h3><div className="text-sm space-y-1">{user.present_address && <p><strong>Present Address:</strong> {user.present_address}</p>}{user.permanent_address && <p><strong>Permanent Address:</strong> {user.permanent_address}</p>}</div></div>)}
          {(user.college_university || user.course) && (<div><h3 className="font-semibold text-gray-800 mb-2">Educational Information</h3><div className="text-sm space-y-1">{user.college_university && <p><strong>College/University:</strong> {user.college_university}</p>}{user.course && <p><strong>Course:</strong> {user.course}</p>}</div></div>)}
          <div><h3 className="font-semibold text-gray-800 mb-2">Account Information</h3><div className="text-sm space-y-1"><p><strong>User ID:</strong> {user.user_id}</p><p><strong>Role ID:</strong> {user.role_id}</p><p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p><p><strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleString()}</p>{user.last_login && <p><strong>Last Login:</strong> {new Date(user.last_login).toLocaleString()}</p>}</div></div>
          {user.activityLog && user.activityLog.length > 0 && (<div><h3 className="font-semibold text-gray-800 mb-2">Recent Activity Log</h3><ul className="text-sm space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">{user.activityLog.map(log => (<li key={log.id} className="border-b last:border-b-0 pb-1"><p><strong>Action:</strong> {log.action} - <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span></p><p className="text-xs text-gray-600">Details: {log.details}</p></li>))}</ul></div>)}
        </div>
        <div className="p-6 bg-gray-50 border-t rounded-b-lg text-right">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  ); 
}

function ConfirmationModal({ isOpen, onClose, onConfirm, action, userName, selectedCount }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, action: 'deactivate' | 'delete' | 'deactivate-bulk' | 'delete-bulk' | null, userName: string, selectedCount: number }) {
  if (!isOpen || !action) return null;
  const isBulk = action.includes('bulk');
  const baseAction = isBulk ? action.replace('-bulk', '') : action;
  const config = {deactivate: { title: 'Deactivate User Account', message: isBulk ? `Are you sure you want to deactivate these ${selectedCount} user accounts?` : `Are you sure you want to deactivate the account for ${userName}?`, buttonText: 'Deactivate', buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-white'}, delete: { title: 'Permanently Delete User', message: isBulk ? `Are you sure you want to permanently delete these ${selectedCount} user accounts? This cannot be undone.` : `Are you sure you want to permanently delete the account for ${userName}? This cannot be undone.`, buttonText: 'Delete', buttonClass: 'bg-red-600 hover:bg-red-700 text-white'} };
  const currentConfig = config[baseAction as 'deactivate' | 'delete'];
  return (<div className="fixed inset-0 bg-black/25 overflow-y-auto flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"><div className="p-6"><h2 className="text-lg font-bold text-gray-900">{currentConfig.title}</h2><p className="mt-2 text-sm text-gray-600">{currentConfig.message}</p></div><div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-lg"><button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button><button onClick={onConfirm} className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium ${currentConfig.buttonClass}`}>{currentConfig.buttonText}</button></div></div></div>);
}