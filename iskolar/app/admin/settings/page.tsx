'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import BrandedLoader from '@/app/components/ui/BrandedLoader';
import { usePageGate } from '@/app/hooks/usePageGate';
import { timeAsync } from '@/lib/utils/performance';

type TabType = 'general' | 'email' | 'authPolicy' | 'features' | 'maintenance' | 'audit' | 'danger';

interface Settings {
  general: {
    siteName: string;
    defaultTimezone: string;
    dateFormat: string;
  };
  email: {
    fromAddress: string;
  };
  authPolicy: {
    minLength: number;
    requireUpper: boolean;
    requireLower: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
    allowAdminSignups: boolean;
  };
  features: {
    openApplications: boolean;
    allowApplicationDeletion: boolean;
    enableAIVerification: boolean;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    estimatedEnd?: string;
  };
}

interface AuditLog {
  audit_id: string;
  key: string;
  old_value: unknown;
  new_value: unknown;
  changed_by: string;
  changed_by_email: string;
  changed_at: string;
}

interface SchoolYear {
  id: string;
  academic_year: string;
}

interface Semester {
  id: string;
  name: string;
  applications_open: boolean;
  school_year: SchoolYear | SchoolYear[];
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const gate = usePageGate({ access: true, settings: true, audit: true, semesters: true });
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<SchoolYear | null>(null);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // General tab state
  const [siteName, setSiteName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  
  // Email tab state (no longer storing fromAddress - it's read-only from env)
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  // Features tab state
  const [openApplications, setOpenApplications] = useState(false);
  const [allowAppDeletion, setAllowAppDeletion] = useState(false);
  const [enableAI, setEnableAI] = useState(false);
  
  // Maintenance tab state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedEnd, setEstimatedEnd] = useState('');
  
  // Danger zone state
  const [purgePassword, setPurgePassword] = useState('');
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [purgeDays, setPurgeDays] = useState(90);
  const [purging, setPurging] = useState(false);
  
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteDays, setDeleteDays] = useState(30);
  const [deleting, setDeleting] = useState(false);
  
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetSemesterId, setResetSemesterId] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [resetting, setResetting] = useState(false);
  
  const [exporting, setExporting] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [migrationApplied, setMigrationApplied] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    (async () => {
      try {
        gate.setTaskLoading('access', true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/admin-auth/signin');
          return;
        }

        // Call API route to check if user is super_admin
        const response = await fetch('/api/admin/check-role', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        const data = await response.json();
        
        if (!data.isSuperAdmin) {
          router.push('/admin/dashboard');
          return;
        }

        gate.setTaskLoading('access', false);

        // Fetch all data in parallel for optimal performance
        await Promise.all([
          (async () => {
            gate.setTaskLoading('settings', true);
            await timeAsync('fetch-settings', fetchSettings);
            gate.setTaskLoading('settings', false);
          })(),
          (async () => {
            gate.setTaskLoading('audit', true);
            await timeAsync('fetch-audit-logs', fetchAuditLogs);
            gate.setTaskLoading('audit', false);
          })(),
          (async () => {
            gate.setTaskLoading('semesters', true);
            await timeAsync('fetch-semesters', fetchSemesters);
            gate.setTaskLoading('semesters', false);
          })()
        ]);
      } catch (error) {
        console.error('Error loading settings:', error);
        gate.setTaskLoading('access', false);
        gate.setTaskLoading('settings', false);
        gate.setTaskLoading('audit', false);
        gate.setTaskLoading('semesters', false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setCurrentSchoolYear(data.currentSchoolYear);
      setCurrentSemester(data.currentSemester);
      
      // Mark migration as applied if we successfully fetched settings
      setMigrationApplied(true);
      
      // Populate form fields
      setSiteName(data.settings.general.siteName);
      setTimezone(data.settings.general.defaultTimezone);
      setDateFormat(data.settings.general.dateFormat);
      // Note: fromAddress removed - it's read-only from environment variables
      setOpenApplications(data.settings.features.openApplications);
      setAllowAppDeletion(data.settings.features.allowApplicationDeletion);
      setEnableAI(data.settings.features.enableAIVerification);
      setMaintenanceMode(data.settings.maintenance.maintenanceMode);
      setMaintenanceMessage(data.settings.maintenance.maintenanceMessage);
      setEstimatedEnd(data.settings.maintenance.estimatedEnd || '');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load settings. Please ensure database migrations have been run.' 
      });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings/audit?limit=100', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        // If audit table doesn't exist yet, just set empty array
        console.warn('Audit logs not available. Run migration to enable audit logging.');
        setAuditLogs([]);
        return;
      }

      const data = await response.json();
      setAuditLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setAuditLogs([]); // Set empty array on error
    }
  };

  const fetchSemesters = async () => {
    try {
      const { data } = await supabase
        .from('semesters')
        .select('id, name, applications_open, school_year:school_year_id(id, academic_year)')
        .order('name', { ascending: false });

      setSemesters((data as unknown as Semester[]) || []);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    }
  };

  const saveSettings = async (key: string, value: unknown) => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          changes: { [key]: value }
        })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
        setTimeout(() => setMessage(null), 3000);
        fetchAuditLogs(); // Refresh audit log
      } else {
        throw new Error('Some settings failed to save');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter recipient email address' });
      return;
    }

    try {
      setSendingTest(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          recipientEmail: testEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setMessage({ type: 'success', text: data.message });
      setTestEmail('');
    } catch (error: unknown) {
      console.error('Failed to send test email:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send test email' });
    } finally {
      setSendingTest(false);
    }
  };

  const handlePurgeUsers = async () => {
    if (!purgePassword || purgeConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please enter password and type DELETE to confirm' });
      return;
    }

    try {
      setPurging(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings/danger/purge-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          password: purgePassword,
          confirmationText: purgeConfirmText,
          inactiveDays: purgeDays
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purge users');
      }

      setMessage({ type: 'success', text: data.message });
      setPurgePassword('');
      setPurgeConfirmText('');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to purge users' });
    } finally {
      setPurging(false);
    }
  };

  const handleDeleteDrafts = async () => {
    if (!deletePassword || deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please enter password and type DELETE to confirm' });
      return;
    }

    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings/danger/delete-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          password: deletePassword,
          confirmationText: deleteConfirmText,
          olderThanDays: deleteDays
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete drafts');
      }

      setMessage({ type: 'success', text: data.message });
      setDeletePassword('');
      setDeleteConfirmText('');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete drafts' });
    } finally {
      setDeleting(false);
    }
  };

  const handleResetSemester = async () => {
    if (!resetPassword || resetConfirmText !== 'DELETE' || !resetSemesterId) {
      setMessage({ type: 'error', text: 'Please enter password, select semester, and type DELETE to confirm' });
      return;
    }

    try {
      setResetting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/settings/danger/reset-semester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          password: resetPassword,
          confirmationText: resetConfirmText,
          semesterId: resetSemesterId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset semester');
      }

      setMessage({ type: 'success', text: data.message });
      setResetPassword('');
      setResetConfirmText('');
      setResetSemesterId('');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to reset semester' });
    } finally {
      setResetting(false);
    }
  };

  const handleExport = async (type: 'users' | 'admins' | 'applications') => {
    try {
      setExporting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/settings/export?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      // Download CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iskolar_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: `Exported ${type} successfully` });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to export data' });
    } finally {
      setExporting(false);
    }
  };

  if (!gate.allDone()) {
    return (
      <BrandedLoader 
        title="Loading Settings" 
        subtitle="Loading configuration, audit history, and semesters…" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-level settings and perform administrative operations</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Migration Warning Banner */}
        {!migrationApplied && !message && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-700 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">Database Migration Required</h3>
                <p className="text-sm text-yellow-700">
                  The System Settings tables have not been created yet. Please run the migration file:
                  <code className="ml-1 px-2 py-0.5 bg-yellow-200 rounded text-xs">supabase/migrations/20251027_app_settings.sql</code>
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Settings will use default values until the migration is applied. Some features (audit logging, persistence) will not work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'general', label: 'General' },
                { id: 'email', label: 'Email' },
                { id: 'authPolicy', label: 'Auth Policy' },
                { id: 'features', label: 'Features' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'audit', label: 'Audit Log' },
                { id: 'danger', label: 'Danger Zone' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                  
                  {/* Read-only current school year/semester */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">Current Academic Period</h3>
                    <p className="text-blue-800">
                      <span className="font-semibold">School Year:</span> {currentSchoolYear?.academic_year || 'Not set'}
                    </p>
                    <p className="text-blue-800">
                      <span className="font-semibold">Semester:</span> {currentSemester?.name || 'Not set'}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      These are managed in the School Years section and are read-only here.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                        <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <button
                      onClick={() => saveSettings('general', { siteName, defaultTimezone: timezone, dateFormat })}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save General Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-900 text-sm">
                      <strong>Note:</strong> Email configuration is managed through environment variables for security. 
                      These settings are read-only and must be changed in your <code className="bg-blue-100 px-1 rounded">.env</code> file.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">FROM Email Address</label>
                      <input
                        type="email"
                        value="iskolar.learnersaidresource@gmail.com"
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Configured as:</strong> iskolar.learnersaidresource@gmail.com
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Display Name:</strong> IskoLAR Support
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        To change: Update <code className="bg-gray-100 px-1 rounded">EMAIL_FROM</code> in your .env file and restart the server.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                      <input
                        type="text"
                        value="SendGrid"
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Configured via <code className="bg-gray-100 px-1 rounded">SENDGRID_API_KEY</code> environment variable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a test email to verify your SendGrid configuration is working correctly.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter your email address to receive a test message.
                      </p>
                    </div>

                    <button
                      onClick={handleSendTestEmail}
                      disabled={sendingTest || !testEmail}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingTest ? 'Sending...' : 'Send Test Email'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Policy Tab */}
            {activeTab === 'authPolicy' && settings && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Authentication Policy</h2>
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p className="text-yellow-800">
                      <strong>Note:</strong> These settings are for display purposes only. 
                      Password enforcement is handled by Supabase Auth configuration.
                      To modify these rules, update your Supabase Auth settings in the Supabase dashboard.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Password Requirements</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Minimum Length: {settings.authPolicy.minLength} characters</li>
                        <li>• Require Uppercase: {settings.authPolicy.requireUpper ? 'Yes' : 'No'}</li>
                        <li>• Require Lowercase: {settings.authPolicy.requireLower ? 'Yes' : 'No'}</li>
                        <li>• Require Numbers: {settings.authPolicy.requireNumber ? 'Yes' : 'No'}</li>
                        <li>• Require Symbols: {settings.authPolicy.requireSymbol ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Admin Signups</h3>
                      <p className="text-gray-700">
                        Allow Admin Signups: {settings.authPolicy.allowAdminSignups ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Toggle features on/off. Changes are saved automatically.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">Open Applications</h3>
                        <p className="text-sm text-gray-600">Allow users to submit new scholarship applications</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newValue = !openApplications;
                          setOpenApplications(newValue);
                          await saveSettings('features', { 
                            openApplications: newValue,
                            allowApplicationDeletion: allowAppDeletion,
                            enableAIVerification: enableAI
                          });
                        }}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          openApplications 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {saving ? '...' : (openApplications ? 'Enabled' : 'Disabled')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">Allow Application Deletion</h3>
                        <p className="text-sm text-gray-600">Allow users to delete their draft applications</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newValue = !allowAppDeletion;
                          setAllowAppDeletion(newValue);
                          await saveSettings('features', { 
                            openApplications,
                            allowApplicationDeletion: newValue,
                            enableAIVerification: enableAI
                          });
                        }}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          allowAppDeletion 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {saving ? '...' : (allowAppDeletion ? 'Enabled' : 'Disabled')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">AI Document Verification</h3>
                        <p className="text-sm text-gray-600">Enable AI-powered document verification for applications</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newValue = !enableAI;
                          setEnableAI(newValue);
                          await saveSettings('features', { 
                            openApplications,
                            allowApplicationDeletion: allowAppDeletion,
                            enableAIVerification: newValue
                          });
                        }}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          enableAI 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {saving ? '...' : (enableAI ? 'Enabled' : 'Disabled')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Maintenance Mode</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Control system-wide maintenance banner and message.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600">Display maintenance banner to all users</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newMode = !maintenanceMode;
                          setMaintenanceMode(newMode);
                          await saveSettings('maintenance', { 
                            maintenanceMode: newMode,
                            maintenanceMessage,
                            estimatedEnd: estimatedEnd || null
                          });
                        }}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          maintenanceMode 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {saving ? '...' : (maintenanceMode ? 'Active' : 'Inactive')}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                      <textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="System is under maintenance. Please check back later."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This message will be displayed in the maintenance banner when active.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated End Time (Optional)</label>
                      <input
                        type="datetime-local"
                        value={estimatedEnd}
                        onChange={(e) => setEstimatedEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        When will maintenance be complete? This will show a countdown timer to users.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        await saveSettings('maintenance', { 
                          maintenanceMode, 
                          maintenanceMessage,
                          estimatedEnd: estimatedEnd || null
                        });
                      }}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Maintenance Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
                  <p className="text-gray-600 mb-4">Last 100 setting changes</p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setting Key</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No audit logs yet</td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.audit_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(log.changed_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.changed_by_email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.key}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <pre className="max-w-xs overflow-x-auto text-xs">{JSON.stringify(log.old_value, null, 2)}</pre>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <pre className="max-w-xs overflow-x-auto text-xs">{JSON.stringify(log.new_value, null, 2)}</pre>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                  <p className="text-gray-600 mb-6">These operations are irreversible. Proceed with extreme caution.</p>
                  
                  {/* Purge Inactive Users */}
                  <div className="border-2 border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Purge Inactive Users</h3>
                    <p className="text-gray-600 mb-4">
                      Delete users who have not signed in for X days and have no applications.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inactive Days</label>
                        <input
                          type="number"
                          min={30}
                          value={purgeDays}
                          onChange={(e) => setPurgeDays(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Password</label>
                        <input
                          type="password"
                          value={purgePassword}
                          onChange={(e) => setPurgePassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={purgeConfirmText}
                          onChange={(e) => setPurgeConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <button
                        onClick={handlePurgeUsers}
                        disabled={purging || purgeConfirmText !== 'DELETE'}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {purging ? 'Purging...' : 'Purge Inactive Users'}
                      </button>
                    </div>
                  </div>

                  {/* Delete Draft Applications */}
                  <div className="border-2 border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Delete Old Draft Applications</h3>
                    <p className="text-gray-600 mb-4">
                      Delete all draft applications older than X days.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Older Than (Days)</label>
                        <input
                          type="number"
                          min={7}
                          value={deleteDays}
                          onChange={(e) => setDeleteDays(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Password</label>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <button
                        onClick={handleDeleteDrafts}
                        disabled={deleting || deleteConfirmText !== 'DELETE'}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Delete Old Drafts'}
                      </button>
                    </div>
                  </div>

                  {/* Reset Semester */}
                  <div className="border-2 border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Reset Semester</h3>
                    <p className="text-gray-600 mb-4">
                      Delete ALL applications for a specific semester. This cannot be undone.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
                        <select
                          value={resetSemesterId}
                          onChange={(e) => setResetSemesterId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">-- Select Semester --</option>
                          {semesters.filter(s => !s.applications_open).map((sem) => (
                            <option key={sem.id} value={sem.id}>
                              {sem.name} (S.Y. {Array.isArray(sem.school_year) ? sem.school_year[0]?.academic_year : sem.school_year?.academic_year})
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Semester with open applications is not available for reset</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Password</label>
                        <input
                          type="password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={resetConfirmText}
                          onChange={(e) => setResetConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <button
                        onClick={handleResetSemester}
                        disabled={resetting || resetConfirmText !== 'DELETE' || !resetSemesterId}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {resetting ? 'Resetting...' : 'Reset Semester'}
                      </button>
                    </div>
                  </div>

                  {/* Export Data */}
                  <div className="border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Export Data (CSV)</h3>
                    <p className="text-gray-600 mb-4">
                      Download user, admin, or application data as CSV files.
                    </p>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleExport('users')}
                        disabled={exporting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Export Users
                      </button>
                      <button
                        onClick={() => handleExport('admins')}
                        disabled={exporting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Export Admins
                      </button>
                      <button
                        onClick={() => handleExport('applications')}
                        disabled={exporting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Export Applications
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
