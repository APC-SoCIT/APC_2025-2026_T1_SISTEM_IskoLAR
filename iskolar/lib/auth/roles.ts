// Centralized role management for admin authentication
// This module provides constants and helper functions for role-based access control

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Role Constants
// ============================================================================

export const ROLE_NAMES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const ROLE_IDS = {
  ADMIN: '4f53ccf0-9d4a-4345-8061-50a1e728494d',
  SUPER_ADMIN: 'ebfbc2ad-e3e6-43c2-bae8-f54637964b37',
} as const;

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];
export type AdminRoleName = 'admin' | 'super_admin';

// Role display information
export const ROLE_INFO: Record<RoleName, { title: string; description: string }> = {
  admin: {
    title: 'Application Management',
    description: 'Can manage applications, semesters, and view reports',
  },
  super_admin: {
    title: 'Super Administrator',
    description: 'Full platform access including user management and destructive operations',
  },
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface AdminUser {
  admin_id: string;
  email_address: string;
  role_id: string;
  created_at?: string;
  updated_at?: string;
  role?: {
    role_id: string;
    name: RoleName;
    description?: string;
  };
}

export interface RoleCheckResult {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roleName?: RoleName;
  roleTitle?: string;
  adminData?: AdminUser;
}

// Type for Supabase query result with nested role
interface AdminWithRole {
  admin_id: string;
  email_address: string;
  role_id: string;
  created_at?: string;
  updated_at?: string;
  role: {
    role_id: string;
    name: RoleName;
    description?: string;
  } | null;
}

// Type for partial admin query with only role
interface AdminRoleOnly {
  role: {
    name: RoleName;
  } | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a Supabase admin client for server-side operations
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Checks if an email belongs to any admin role (admin or super_admin)
 * @param sessionEmail - The email address to check
 * @returns Promise with admin status and role information
 */
export async function isAdmin(sessionEmail: string): Promise<RoleCheckResult> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select(`
        *,
        role:role!role_id (
          role_id,
          name,
          description
        )
      `)
      .eq('email_address', sessionEmail)
      .single();

    if (error || !data) {
      return {
        isAdmin: false,
        isSuperAdmin: false,
      };
    }

    const adminWithRole = data as AdminWithRole;
    const roleName = adminWithRole.role?.name;
    
    if (!roleName) {
      return {
        isAdmin: false,
        isSuperAdmin: false,
      };
    }

    const isAdminRole = roleName === ROLE_NAMES.ADMIN || roleName === ROLE_NAMES.SUPER_ADMIN;
    const isSuperAdminRole = roleName === ROLE_NAMES.SUPER_ADMIN;

    return {
      isAdmin: isAdminRole,
      isSuperAdmin: isSuperAdminRole,
      roleName,
      roleTitle: ROLE_INFO[roleName]?.title,
      adminData: data as AdminUser,
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return {
      isAdmin: false,
      isSuperAdmin: false,
    };
  }
}

/**
 * Checks if an email belongs to a super_admin
 * @param sessionEmail - The email address to check
 * @returns Promise with boolean indicating super_admin status
 */
export async function isSuperAdmin(sessionEmail: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select(`
        role:role!role_id (
          name
        )
      `)
      .eq('email_address', sessionEmail)
      .single();

    if (error || !data) {
      return false;
    }

    // Supabase returns the role as an object, not an array
    const adminRoleData = data as unknown as AdminRoleOnly;
    const roleName = adminRoleData.role?.name;
    return roleName === ROLE_NAMES.SUPER_ADMIN;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Gets admin user information by email
 * @param sessionEmail - The email address to look up
 * @returns Promise with admin user data or null
 */
export async function getAdminByEmail(sessionEmail: string): Promise<AdminUser | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select(`
        *,
        role:role!role_id (
          role_id,
          name,
          description
        )
      `)
      .eq('email_address', sessionEmail)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AdminUser;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

/**
 * Validates if the current user has permission for a specific action
 * @param sessionEmail - The email of the user to check
 * @param requiredRole - The minimum role required ('admin' or 'super_admin')
 * @returns Promise with boolean indicating if user has permission
 */
export async function hasPermission(
  sessionEmail: string,
  requiredRole: 'admin' | 'super_admin'
): Promise<boolean> {
  const result = await isAdmin(sessionEmail);

  if (!result.isAdmin) {
    return false;
  }

  if (requiredRole === 'super_admin') {
    return result.isSuperAdmin;
  }

  // For 'admin' requirement, both admin and super_admin have access
  return result.isAdmin;
}

/**
 * Checks if a user is an admin (any role in admin table)
 * Used for preventing admins from submitting scholarship applications
 * @param sessionEmail - The email address to check
 * @returns Promise with boolean
 */
export async function isAdminUser(sessionEmail: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('admin_id')
      .eq('email_address', sessionEmail)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
}

// ============================================================================
// UI Helper Functions (Client-Safe)
// ============================================================================

/**
 * Returns display title for a role
 */
export function roleDisplay(role: AdminRoleName): string {
  return role === 'super_admin' ? 'Super Administrator' : 'Administrator';
}

/**
 * Returns subtitle for a role
 */
export function roleSubtitle(role: AdminRoleName): string {
  return role === 'super_admin' ? 'System Management' : 'Application Management';
}

/**
 * Check if role can manage admin accounts
 */
export function canManageAdmins(role: AdminRoleName): boolean {
  return role === 'super_admin';
}

/**
 * Check if role can create users
 */
export function canCreateUsers(role: AdminRoleName): boolean {
  return role === 'super_admin';
}

/**
 * Check if role can edit or delete users
 */
export function canEditOrDeleteUsers(role: AdminRoleName): boolean {
  return role === 'super_admin';
}

/**
 * Check if role can archive users
 */
export function canArchiveUsers(role: AdminRoleName): boolean {
  return role === 'admin' || role === 'super_admin';
}
