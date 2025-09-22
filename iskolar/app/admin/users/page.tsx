"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UserMinusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

// --- TYPE DEFINITIONS & MOCK DATA ---
type UserRole = 'Admin' | 'Scholar' | 'Applicant';
type UserStatus = 'Active' | 'Inactive';
type ActivityLog = { id: string; action: string; timestamp: string; details: string; };
type User = { id: string; name: string; email: string; role: UserRole; status: UserStatus; createdAt: string; lastLogin: string; profileInfo: { program?: string; yearLevel?: number; contactNumber?: string; }; activityLog: ActivityLog[]; };
const MOCK_USERS: User[] = [
    { id: 'usr_001', name: 'Joana Marie', email: 'joana.marie@example.com', role: 'Admin', status: 'Active', createdAt: '2024-01-15T10:00:00Z', lastLogin: new Date().toISOString(), profileInfo: { contactNumber: '09171234567' }, activityLog: [{ id: 'l1', action: 'Created Announcement', timestamp: '2025-09-20T14:00:00Z', details: 'ID: ann_123' }] },
    { id: 'usr_002', name: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', role: 'Scholar', status: 'Active', createdAt: '2024-02-20T11:30:00Z', lastLogin: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), profileInfo: { program: 'BS Computer Science', yearLevel: 3 }, activityLog: [{ id: 'l2', action: 'Viewed Disbursement', timestamp: '2025-09-19T09:15:00Z', details: 'Schedule for Oct 2025' }] },
    { id: 'usr_003', name: 'Maria Clara', email: 'maria.clara@example.com', role: 'Scholar', status: 'Inactive', createdAt: '2024-03-10T09:00:00Z', lastLogin: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(), profileInfo: { program: 'BA Communication', yearLevel: 4 }, activityLog: [{ id: 'l3', action: 'Login', timestamp: '2025-05-10T12:00:00Z', details: 'Successful login' }] },
    { id: 'usr_004', name: 'Crisostomo Ibarra', email: 'cris.ibarra@example.com', role: 'Scholar', status: 'Active', createdAt: '2024-04-05T14:20:00Z', lastLogin: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), profileInfo: { program: 'BS Civil Engineering', yearLevel: 2 }, activityLog: [{ id: 'l4', action: 'Updated Profile', timestamp: '2025-09-18T11:00:00Z', details: 'Changed contact number' }] },
    { id: 'usr_005', name: 'Elias Salvador', email: 'elias.s@example.com', role: 'Applicant', status: 'Active', createdAt: '2025-08-30T14:20:00Z', lastLogin: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(), profileInfo: { contactNumber: '09189876543' }, activityLog: [{ id: 'l5', action: 'Submitted Application', timestamp: '2025-08-30T14:20:00Z', details: 'Initial submission' }] },
];
// --- END MOCK DATA ---

interface UserFilters {
  selectedRoles: UserRole[];
  selectedStatuses: UserStatus[];
  lastLogin: 'all' | '2months' | '3months';
}

const UserPill = ({ type, value }: { type: 'role' | 'status', value: UserRole | UserStatus }) => {
  const configs = {
    role: { Admin: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }, Scholar: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }, Applicant: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }, },
    status: { Active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }, Inactive: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }, }
  };
  const config =
    type === 'role'
      ? configs.role[value as UserRole]
      : configs.status[value as UserStatus];
  return (<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}><span className={`h-1.5 w-1.5 rounded-full ${type === 'status' ? (value === 'Active' ? 'bg-green-500' : 'bg-red-500') : (value === 'Admin' ? 'bg-blue-500' : value === 'Scholar' ? 'bg-green-500' : 'bg-purple-500')}`}></span>{value}</span>);
};

const formatLastLogin = (dateString: string) => {
  const lastLogin = new Date(dateString); const now = new Date(); const diffInMs = now.getTime() - lastLogin.getTime(); const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); const diffInMonths = (now.getFullYear() - lastLogin.getFullYear()) * 12 + (now.getMonth() - lastLogin.getMonth());
  let text = ''; let color = '';
  if (diffInMonths < 2) { if (diffInDays <= 0) text = 'Today'; else if (diffInDays === 1) text = 'Yesterday'; else text = `${diffInDays} days ago`; color = 'text-green-600'; }
  else if (diffInMonths < 3) { text = 'Over 2 months ago'; color = 'text-green-600'; }
  else { text = `Over 3 months ago`; color = 'text-red-600'; }
  return <span className={`font-medium ${color}`}>{text}</span>;
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

  useEffect(() => { setUsers(MOCK_USERS); }, []);

  const filteredUsers = useMemo(() => {
    const now = new Date();
    return users
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filters.selectedRoles.length === 0 || filters.selectedRoles.includes(user.role);
        const matchesStatus = filters.selectedStatuses.length === 0 || filters.selectedStatuses.includes(user.status);
        let matchesLastLogin = true;
        if(filters.lastLogin !== 'all') {
            const lastLoginDate = new Date(user.lastLogin);
            const diffInMonths = (now.getFullYear() - lastLoginDate.getFullYear()) * 12 + (now.getMonth() - lastLoginDate.getMonth());
            if(filters.lastLogin === '2months') matchesLastLogin = diffInMonths < 2;
            if(filters.lastLogin === '3months') matchesLastLogin = diffInMonths >= 3;
        }
        return matchesSearch && matchesRole && matchesStatus && matchesLastLogin;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, searchQuery, filters]);

  const userCounts = useMemo(() => {
      return {
          roles: {
              Admin: users.filter(u => u.role === 'Admin').length,
              Scholar: users.filter(u => u.role === 'Scholar').length,
              Applicant: users.filter(u => u.role === 'Applicant').length,
          },
          statuses: {
              Active: users.filter(u => u.status === 'Active').length,
              Inactive: users.filter(u => u.status === 'Inactive').length,
          }
      }
  }, [users]);
  
  const handleApplyFilters = (newFilters: UserFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); };
  const handleResetFilters = () => { setFilters({ selectedRoles: [], selectedStatuses: [], lastLogin: 'all' }); setIsFilterModalOpen(false); };
  
  const activeFilterCount = filters.selectedRoles.length + filters.selectedStatuses.length + (filters.lastLogin !== 'all' ? 1 : 0);

  const handleSelectUser = (userId: string) => { setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) { setSelectedUserIds(filteredUsers.map(u => u.id)); } else { setSelectedUserIds([]); } };
  const handleOpenBulkConfirm = (action: 'deactivate-bulk' | 'delete-bulk') => { setConfirmAction(action); setIsConfirmModalOpen(true); };
  const handleOpenDetails = (user: User) => { setSelectedUser(user); setIsDetailsModalOpen(true); };
  const handleOpenConfirm = (user: User, action: 'deactivate' | 'delete') => { setSelectedUser(user); setConfirmAction(action); setIsConfirmModalOpen(true); };
  const handleCloseModals = () => { setIsDetailsModalOpen(false); setIsConfirmModalOpen(false); setSelectedUser(null); setConfirmAction(null); };
  const handleConfirmAction = () => { if ((confirmAction === 'deactivate' || confirmAction === 'delete') && selectedUser) { if (confirmAction === 'deactivate') { setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Inactive' } : u)); } if (confirmAction === 'delete') { setUsers(users.filter(u => u.id !== selectedUser.id)); } } if (confirmAction === 'deactivate-bulk') { setUsers(users.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Inactive' } : u)); } if (confirmAction === 'delete-bulk') { setUsers(users.filter(u => !selectedUserIds.includes(u.id))); } setSelectedUserIds([]); handleCloseModals(); };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-1"><h1 className="text-2xl font-semibold text-gray-900">IskoLAR User Management</h1><p className="text-sm text-gray-500">Monitor, deactivate, or delete user accounts.</p></div>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input type="text" placeholder="Search users by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white" />
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
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 invisible opacity-0 translate-y-1 transition-all duration-200 ease-in-out z-50 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0"><div className="py-1"><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>View Profile</Link><Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</Link><hr className="my-1 border-gray-200" /><button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Sign out</button></div></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Registered Users ({filteredUsers.length})
          </h2>
        </div>
        {selectedUserIds.length > 0 && (<div className="px-6 py-3 bg-blue-50 border-b border-blue-200"><div className="flex items-center justify-between"><span className="text-sm font-medium text-blue-800">{selectedUserIds.length} user(s) selected</span><div className="space-x-2"><button onClick={() => handleOpenBulkConfirm('deactivate-bulk')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><UserMinusIcon className="h-4 w-4"/>Deactivate</button><button onClick={() => handleOpenBulkConfirm('delete-bulk')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"><TrashIcon className="h-4 w-4"/>Delete</button></div></div></div>)}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-center">
                  {/*
                    Use a ref to set indeterminate property on the checkbox input.
                  */}
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className={`group transition-colors duration-150 ${selectedUserIds.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedUserIds.includes(user.id)} onChange={() => handleSelectUser(user.id)} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0"><div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center"><span className="text-blue-600 font-medium text-sm">{user.name.charAt(0)}</span></div></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{user.name}</div><div className="text-sm text-gray-500">{user.email}</div></div></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><UserPill type="role" value={user.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><UserPill type="status" value={user.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatLastLogin(user.lastLogin)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-2"><button onClick={() => handleOpenDetails(user)} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700" title="View Details"><EyeIcon className="h-4 w-4" /></button><button onClick={() => handleOpenConfirm(user, 'deactivate')} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-yellow-500 rounded-lg shadow-sm hover:bg-yellow-600" title="Deactivate User"><UserMinusIcon className="h-4 w-4" /></button><button onClick={() => handleOpenConfirm(user, 'delete')} className="flex items-center justify-center p-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700" title="Delete User"><TrashIcon className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <UserFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} onReset={handleResetFilters} initialFilters={filters} counts={userCounts} />
      <UserDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseModals} user={selectedUser} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseModals} onConfirm={handleConfirmAction} action={confirmAction} selectedCount={selectedUserIds.length} userName={selectedUser?.name || ''} />
    </div>
  );
}

// --- NEW: Filter Modal Component (Cohesive with example) ---
interface UserFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: UserFilters) => void;
  onReset: () => void;
  initialFilters: UserFilters;
  counts: { roles: Record<UserRole, number>; statuses: Record<UserStatus, number>; };
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
  const handleLocalReset = () => {
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setLastLogin('all');
    // Call the main reset function to clear filters in parent component
    onReset();
  };

  if (!isOpen) return null;

  const toggleCheckbox = <T extends string>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    setList((current: T[]) => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  };

  return (
    <div className="fixed inset-0 bg-black/25 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b pb-4"><h3 className="text-xl font-semibold text-gray-900">Filter Users</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <div className="space-y-2">
              {(['Admin', 'Scholar', 'Applicant'] as UserRole[]).map(role => {
                const roleColors = {
                  Admin: 'bg-blue-50 text-blue-700 border-blue-200',
                  Scholar: 'bg-green-50 text-green-700 border-green-200', 
                  Applicant: 'bg-purple-50 text-purple-700 border-purple-200'
                };
                return (
                  <label key={role} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-start w-full">
                      <input 
                        type="checkbox" 
                        checked={selectedRoles.includes(role)} 
                        onChange={() => toggleCheckbox(selectedRoles, setSelectedRoles, role)} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-900">{role}</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[role]}`}>
                      {counts.roles[role]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <div className="space-y-2">
              {(['Active', 'Inactive'] as UserStatus[]).map(status => {
                const statusColors = {
                  Active: 'bg-green-50 text-green-700 border-green-200',
                  Inactive: 'bg-red-50 text-red-700 border-red-200'
                };
                return (
                  <label key={status} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-start w-full">
                      <input 
                        type="checkbox" 
                        checked={selectedStatuses.includes(status)} 
                        onChange={() => toggleCheckbox(selectedStatuses, setSelectedStatuses, status)} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-900">{status}</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                      {counts.statuses[status]}
                    </span>
                  </label>
                );
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
          <button onClick={handleLocalReset} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Reset</button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

// (UserDetailsModal and ConfirmationModal are unchanged)
function UserDetailsModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User | null }) { if (!isOpen || !user) return null; return (<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"><div className="flex justify-between items-center p-6 border-b"><h2 className="text-xl font-bold text-gray-900">User Account Details</h2><button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">&times;</button></div><div className="p-6 flex-grow overflow-y-auto space-y-6"><div><h3 className="font-semibold text-gray-800 mb-2">Profile Information</h3><div className="text-sm space-y-1"><p><strong>Name:</strong> {user.name}</p><p><strong>Email:</strong> {user.email}</p><p><strong>Role:</strong> {user.role}</p><p><strong>Status:</strong> {user.status}</p>{user.profileInfo.program && <p><strong>Program:</strong> {user.profileInfo.program}</p>}{user.profileInfo.yearLevel && <p><strong>Year Level:</strong> {user.profileInfo.yearLevel}</p>}{user.profileInfo.contactNumber && <p><strong>Contact:</strong> {user.profileInfo.contactNumber}</p>}</div></div><div><h3 className="font-semibold text-gray-800 mb-2">Recent Activity Log</h3><ul className="text-sm space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">{user.activityLog.map(log => (<li key={log.id} className="border-b last:border-b-0 pb-1"><p><strong>Action:</strong> {log.action} - <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span></p><p className="text-xs text-gray-600">Details: {log.details}</p></li>))}</ul></div></div><div className="p-6 bg-gray-50 border-t rounded-b-lg text-right"><button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Close</button></div></div></div>); }
function ConfirmationModal({ isOpen, onClose, onConfirm, action, userName, selectedCount }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, action: 'deactivate' | 'delete' | 'deactivate-bulk' | 'delete-bulk' | null, userName: string, selectedCount: number }) {
  if (!isOpen || !action) return null;
  const isBulk = action.includes('bulk');
  const baseAction = isBulk ? action.replace('-bulk', '') : action;
  const config = {deactivate: { title: 'Deactivate User Account', message: isBulk ? `Are you sure you want to deactivate these ${selectedCount} user accounts?` : `Are you sure you want to deactivate the account for ${userName}?`, buttonText: 'Deactivate', buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-white'}, delete: { title: 'Permanently Delete User', message: isBulk ? `Are you sure you want to permanently delete these ${selectedCount} user accounts? This cannot be undone.` : `Are you sure you want to permanently delete the account for ${userName}? This cannot be undone.`, buttonText: 'Delete', buttonClass: 'bg-red-600 hover:bg-red-700 text-white'} };
  const currentConfig = config[baseAction as 'deactivate' | 'delete'];
  return (<div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"><div className="p-6"><h2 className="text-lg font-bold text-gray-900">{currentConfig.title}</h2><p className="mt-2 text-sm text-gray-600">{currentConfig.message}</p></div><div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-lg"><button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button><button onClick={onConfirm} className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium ${currentConfig.buttonClass}`}>{currentConfig.buttonText}</button></div></div></div>);
}