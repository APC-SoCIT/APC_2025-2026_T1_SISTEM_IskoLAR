"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, UserPlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { supabaseBrowser } from '@/lib/supabase/browser';

type AdminRole = 'admin' | 'super_admin';

type Admin = {
  admin_id: string;
  email_address: string;
  role: {
    role_id: string;
    name: AdminRole;
    description: string;
  };
  created_at: string;
  updated_at: string;
};

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  role: AdminRole;
  confirmationPassword?: string; // For confirming sensitive operations (promote/demote/delete)
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'promote' | 'demote'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    confirmationPassword: ''
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  }, []);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[fetchAdmins] Getting session...');
      const supabase = supabaseBrowser();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('[fetchAdmins] No session found:', sessionError);
        throw new Error('No active session. Please log in again.');
      }
      
      console.log('[fetchAdmins] Session found, fetching admins...');
      const response = await fetch('/api/admin-auth/admins', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      console.log('[fetchAdmins] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[fetchAdmins] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch admins');
      }
      
      const data = await response.json();
      console.log('[fetchAdmins] Fetched', data?.length || 0, 'admins');
      setAdmins(data);
    } catch (error) {
      console.error('[fetchAdmins] Error fetching admins:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to fetch admin list', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      confirmationPassword: ''
    });
  };

  const openModal = (mode: 'create' | 'edit' | 'delete' | 'promote' | 'demote', admin?: Admin) => {
    setModalMode(mode);
    setSelectedAdmin(admin || null);
    if (admin && mode === 'edit') {
      setFormData({
        email: admin.email_address,
        password: '',
        confirmPassword: '',
        role: admin.role.name,
        confirmationPassword: ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    resetForm();
  };

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.password) {
      showNotification('Email and password are required', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      // Get session token
      const supabase = supabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showNotification('No active session. Please log in again.', 'error');
        return;
      }
      
      const response = await fetch('/api/admin-auth/admins', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          roleId: formData.role === 'super_admin' 
            ? 'ebfbc2ad-e3e6-43c2-bae8-f54637964b37' 
            : '4f53ccf0-9d4a-4345-8061-50a1e728494d'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create admin');
      }

      showNotification('Admin created successfully', 'success');
      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error('Error creating admin:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to create admin', 'error');
    }
  };

  const handleUpdateRole = async (admin: Admin, newRole: AdminRole) => {
    // Require password confirmation for sensitive operations
    if (!formData.confirmationPassword) {
      showNotification('Please enter your password to confirm this action', 'error');
      return;
    }

    try {
      // Get session token
      const supabase = supabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showNotification('No active session. Please log in again.', 'error');
        return;
      }

      const response = await fetch(`/api/admin-auth/admins/${admin.admin_id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          roleId: newRole === 'super_admin'
            ? 'ebfbc2ad-e3e6-43c2-bae8-f54637964b37'
            : '4f53ccf0-9d4a-4345-8061-50a1e728494d',
          confirmationPassword: formData.confirmationPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      showNotification(`Admin ${newRole === 'super_admin' ? 'promoted' : 'demoted'} successfully`, 'success');
      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to update role', 'error');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    // Require password confirmation for sensitive operations
    if (!formData.confirmationPassword) {
      showNotification('Please enter your password to confirm deletion', 'error');
      return;
    }

    try {
      // Get session token
      const supabase = supabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showNotification('No active session. Please log in again.', 'error');
        return;
      }

      const response = await fetch(`/api/admin-auth/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          confirmationPassword: formData.confirmationPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete admin');
      }

      showNotification('Admin deleted successfully', 'success');
      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error('Error deleting admin:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to delete admin', 'error');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-600">Manage administrator accounts and permissions</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total Admins: <span className="font-semibold">{admins.length}</span>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Admin
        </button>
      </div>

      {/* Admin List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.admin_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserPlusIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{admin.email_address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.role.name === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.role.name === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {admin.role.name === 'admin' && (
                        <button
                          onClick={() => openModal('promote', admin)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Promote to Super Admin"
                        >
                          <ShieldCheckIcon className="w-5 h-5" />
                        </button>
                      )}
                      {admin.role.name === 'super_admin' && (
                        <button
                          onClick={() => openModal('demote', admin)}
                          className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
                          title="Demote to Admin"
                        >
                          <ShieldCheckIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => openModal('delete', admin)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        title="Delete Admin"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 z-10">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' && 'Create New Admin'}
              {modalMode === 'edit' && 'Edit Admin'}
              {modalMode === 'delete' && 'Delete Admin'}
              {modalMode === 'promote' && 'Promote to Super Admin'}
              {modalMode === 'demote' && 'Demote to Admin'}
            </h2>

            {modalMode === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedAdmin && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedAdmin.email_address}</strong>? This action cannot be undone.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm your password to proceed
                  </label>
                  <input
                    type="password"
                    value={formData.confirmationPassword || ''}
                    onChange={(e) => setFormData({ ...formData, confirmationPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            {modalMode === 'promote' && selectedAdmin && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to promote <strong>{selectedAdmin.email_address}</strong> to Super Admin?
                  They will have full access to all administrative functions.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm your password to proceed
                  </label>
                  <input
                    type="password"
                    value={formData.confirmationPassword || ''}
                    onChange={(e) => setFormData({ ...formData, confirmationPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            {modalMode === 'demote' && selectedAdmin && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to demote <strong>{selectedAdmin.email_address}</strong> to regular Admin?
                  They will lose super admin privileges.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm your password to proceed
                  </label>
                  <input
                    type="password"
                    value={formData.confirmationPassword || ''}
                    onChange={(e) => setFormData({ ...formData, confirmationPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalMode === 'create') handleCreateAdmin();
                  else if (modalMode === 'delete' && selectedAdmin) handleDeleteAdmin(selectedAdmin.admin_id);
                  else if (modalMode === 'promote' && selectedAdmin) handleUpdateRole(selectedAdmin, 'super_admin');
                  else if (modalMode === 'demote' && selectedAdmin) handleUpdateRole(selectedAdmin, 'admin');
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition ${
                  modalMode === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : modalMode === 'demote'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {modalMode === 'create' && 'Create'}
                {modalMode === 'delete' && 'Delete'}
                {modalMode === 'promote' && 'Promote'}
                {modalMode === 'demote' && 'Demote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
