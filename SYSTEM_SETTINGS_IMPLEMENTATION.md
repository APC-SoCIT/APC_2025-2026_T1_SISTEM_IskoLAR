# System Settings Implementation Complete

## ✅ Implementation Summary

### Database Layer
**Migration File**: `supabase/migrations/20251027_app_settings.sql`
- Created `app_settings` table (key/value JSONB storage)
- Created `app_settings_audit` table (automatic change tracking)
- Seeded default settings for all categories
- Implemented RLS policies (authenticated SELECT, super_admin write)
- Automatic audit logging via database trigger

### API Routes (8 new files)

1. **GET/PUT `/api/admin/settings/route.ts`** (195 lines)
   - GET: Fetch all settings merged with defaults + current school year/semester
   - PUT: Update multiple settings with validation
   - All operations require super_admin role

2. **POST `/api/admin/settings/test-email/route.ts`** (115 lines)
   - Sends test email via SendGrid
   - Validates email format
   - Returns detailed error messages

3. **POST `/api/admin/settings/danger/purge-users/route.ts`** (193 lines)
   - Deletes users inactive for X days (min 30)
   - Excludes users with applications
   - Password confirmation + "DELETE" text
   - Rate limited: 3 attempts per hour

4. **POST `/api/admin/settings/danger/delete-drafts/route.ts`** (155 lines)
   - Deletes draft applications older than X days (min 7)
   - Password confirmation + "DELETE" text
   - Rate limited: 3 attempts per hour

5. **POST `/api/admin/settings/danger/reset-semester/route.ts`** (178 lines)
   - Deletes ALL applications for a specific semester
   - Prevents deletion of current semester
   - Password confirmation + "DELETE" text
   - Rate limited: 2 attempts per 24 hours

6. **GET `/api/admin/settings/export/route.ts`** (194 lines)
   - Exports users/admins/applications as CSV
   - Flattens nested data (joins with roles, school years, semesters)
   - Returns downloadable CSV file

7. **GET `/api/admin/settings/audit/route.ts`** (97 lines)
   - Fetches last 100 setting changes
   - Includes changed_by email, old/new values, timestamps

### Frontend UI
**Page**: `/admin/settings/page.tsx` (1019 lines)

#### 7 Tabs Implemented:

1. **General Tab**
   - Site Name (editable)
   - Default Timezone (dropdown: Asia/Manila, Asia/Singapore, UTC)
   - Date Format (dropdown: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
   - Current School Year/Semester (read-only, blue info box)

2. **Email Tab**
   - FROM Email Address (editable)
   - Send Test Email (with recipient input)
   - Server-side SendGrid integration

3. **Auth Policy Tab**
   - Password requirements (display only)
   - Admin signups toggle (display only)
   - Yellow warning: "These are enforced by Supabase Auth"

4. **Features Tab**
   - Open Applications (toggle)
   - Allow Application Deletion (toggle)
   - AI Document Verification (toggle)
   - Settings save immediately on toggle

5. **Maintenance Tab**
   - Maintenance Mode (toggle: Active/Inactive)
   - Maintenance Message (textarea)
   - Save button for message updates

6. **Audit Log Tab**
   - Table with last 100 changes
   - Columns: Timestamp, Changed By, Setting Key, Old Value, New Value
   - JSON pretty-printed in table cells

7. **Danger Zone Tab**
   - **Purge Inactive Users**: Days input (min 30), password, confirmation text
   - **Delete Old Drafts**: Days input (min 7), password, confirmation text
   - **Reset Semester**: Semester dropdown (excludes current), password, confirmation text
   - **Export CSV**: 3 buttons (Users, Admins, Applications)
   - All danger operations require password + typing "DELETE"

### Security Features
- ✅ Bearer token authentication on all routes
- ✅ Super admin role verification
- ✅ Password confirmation for all danger operations
- ✅ Double-confirmation ("DELETE" text) for irreversible actions
- ✅ Rate limiting (in-memory, per-user ID)
  - Purge users: 3/hour
  - Delete drafts: 3/hour
  - Reset semester: 2/24h
- ✅ No secrets exposed to client (SendGrid key server-side only)
- ✅ Automatic audit logging

### Dashboard Update
Updated `app/admin/dashboard/page.tsx`:
- Changed Super Admin Tools description from:
  - "Manage administrators, system settings, and perform destructive operations."
- To:
  - "Manage administrators and platform-level configuration. Application and user management are available in their respective sections."

---

## 📋 Next Steps - USER ACTION REQUIRED

### 1. Run Database Migrations (CRITICAL)

You must run TWO SQL files in your Supabase SQL Editor:

#### A. Fix Admin RLS Policy
```sql
-- File: FIX_ADMIN_RLS_POLICY.sql
-- This fixes the fetchCurrentAdmin function
```
Run this file first to ensure admin authentication works correctly.

#### B. Create Settings Tables
```sql
-- File: supabase/migrations/20251027_app_settings.sql
-- This creates app_settings and app_settings_audit tables
```
Run this file second to enable all System Settings functionality.

### 2. Configure Environment Variables

Ensure your `.env.local` has:
```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NEW: Required for test email feature
SENDGRID_API_KEY=your_sendgrid_api_key
```

**Note**: If you don't have a SendGrid API key, the test email feature will return an error. All other settings features will work fine.

### 3. Install Dependencies (if needed)

The code uses `@sendgrid/mail` package. Check if it's already in `package.json`:

```bash
npm install @sendgrid/mail
```

### 4. Test the Implementation

After running migrations:

1. **Login as super_admin**:
   - Email: `superadmin@iskolar.com`
   - Password: [your password]

2. **Navigate to Settings**:
   - Dashboard → Super Admin Tools → "Settings" link
   - Or directly: `http://localhost:3000/admin/settings`

3. **Test Each Tab**:
   - **General**: Change siteName, verify it saves
   - **Email**: Send test email (if SendGrid configured)
   - **Auth Policy**: Just view (read-only)
   - **Features**: Toggle features on/off
   - **Maintenance**: Enable/disable maintenance mode
   - **Audit Log**: Should show your changes from above
   - **Danger Zone**: Try exporting CSV first (safest operation)

---

## 🔧 Troubleshooting

### Settings page shows 404
- Make sure you ran both SQL migration files
- Restart the development server: `Ctrl+C` then `npm run dev`
- Clear browser cache and reload

### "Failed to fetch settings" error
- Check that `app_settings` table exists in Supabase
- Check browser console for detailed error
- Verify you're logged in as super_admin

### SendGrid errors
- If you see "SendGrid API key not configured", this is expected if you haven't set the env variable
- All other features work without SendGrid
- To fix: Get SendGrid API key → add to `.env.local` → restart server

### Password verification fails on danger operations
- Make sure you're entering YOUR account password (the one you used to login)
- The system calls `supabaseAdmin.auth.signInWithPassword()` to verify
- Check Supabase logs if verification consistently fails

### Rate limit errors
- Rate limits reset automatically (1h for purge/delete, 24h for reset)
- Restart the server to clear in-memory rate limiter
- This is intentional security to prevent accidental mass deletions

---

## 📊 File Structure

```
iskolar/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx (UPDATED: new copy)
│   │   └── settings/page.tsx (NEW: 1019 lines)
│   └── api/
│       └── admin/
│           └── settings/
│               ├── route.ts (NEW: GET/PUT settings)
│               ├── test-email/route.ts (NEW: send test email)
│               ├── audit/route.ts (NEW: get audit logs)
│               ├── export/route.ts (NEW: CSV export)
│               └── danger/
│                   ├── purge-users/route.ts (NEW)
│                   ├── delete-drafts/route.ts (NEW)
│                   └── reset-semester/route.ts (NEW)
└── supabase/
    └── migrations/
        └── 20251027_app_settings.sql (NEW: creates tables)
```

---

## 🎯 Feature Highlights

### Platform-Level Configuration
System Settings is designed for platform-wide configuration, NOT application/user CRUD:
- Site branding (name, timezone, date format)
- Email server configuration
- Feature toggles (AI verification, application submissions)
- Maintenance mode
- Audit trail of all changes
- Data export
- Bulk cleanup operations

### Application & User Management
These are handled in their dedicated sections:
- **Applications**: `/admin/applications` (review, approve, reject)
- **Users**: `/admin/users` (view, manage scholars)
- **Admins**: `/admin/admin-management` (promote, demote, delete)

### Why This Separation?
- **Settings**: System-level configuration (affects entire platform)
- **Management**: Entity-level CRUD (affects individual records)
- Clear mental model for administrators
- Prevents confusion about where to find features

---

## 🔒 Security Architecture

### Role-Based Access Control
- All settings routes verify `isSuperAdmin(email)`
- Regular admins cannot access settings
- Scholars cannot access admin routes

### Password-Gated Destructive Operations
- Purge users: password required
- Delete drafts: password required
- Reset semester: password required
- Server-side verification via `supabaseAdmin.auth.signInWithPassword()`

### Double-Confirmation
- User must type "DELETE" exactly
- Prevents accidental clicks
- Frontend disables button until both password + text entered

### Rate Limiting
- In-memory Map<userId, {count, resetAt}>
- Per-user, not global
- Prevents brute force and accidental rapid-fire deletions
- Resets automatically after time window

### Audit Trail
- All setting changes logged automatically
- Database trigger on UPDATE
- Captures: old value, new value, who, when
- Immutable audit records (no DELETE policy)

---

## 📝 Code Patterns Used

### Bearer Token Authentication
```typescript
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader.substring(7); // Remove "Bearer "
  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);
  return user;
}
```

### Password Verification
```typescript
async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  return !error;
}
```

### CSV Generation
```typescript
function arrayToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  return [csvHeaders, ...csvRows].join('\n');
}
```

---

## 🎨 UI/UX Decisions

### Tabbed Interface
- 7 tabs prevent overwhelming single-page scroll
- Active tab highlighted with blue underline
- Mobile-responsive with horizontal scroll

### Immediate Feedback
- Feature toggles save immediately (no save button)
- Green/gray visual state for enabled/disabled
- Success/error messages in banner at top

### Color-Coded Danger
- Danger operations have red borders
- Delete buttons are red (bg-red-600)
- Export buttons are blue (safe operation)

### Form Validation
- Disabled buttons until required fields filled
- Minimum values enforced (30 days for purge, 7 for drafts)
- "DELETE" text must match exactly

### Loading States
- Spinners on all async operations
- "Saving...", "Sending...", "Purging..." text
- Prevents double-submission

---

## 🧪 Testing Checklist

- [ ] Run both SQL migrations successfully
- [ ] Settings page loads without 404
- [ ] General tab: Change siteName, verify in audit log
- [ ] Email tab: Send test email (if SendGrid configured)
- [ ] Features tab: Toggle all three flags
- [ ] Maintenance tab: Enable mode, change message
- [ ] Audit log tab: Shows recent changes
- [ ] Export CSV: Download users.csv successfully
- [ ] Purge users: Wrong password shows error
- [ ] Delete drafts: "DELETE" typo prevents submission
- [ ] Reset semester: Current semester not in dropdown
- [ ] Dashboard: New copy about settings

---

## 🚀 Performance Considerations

### In-Memory Rate Limiting
- Current implementation: `Map<userId, {count, resetAt}>`
- **Limitation**: Resets on server restart
- **Improvement** (future): Redis or database-backed limiter
- **Why in-memory for now**: Simple, fast, good enough for super_admin-only routes

### Audit Log Pagination
- Currently fetches last 100 records
- **Future**: Add pagination/infinite scroll if audit log grows large
- **Why 100**: Reasonable balance between usefulness and performance

### CSV Export
- Currently loads all records into memory
- **Future**: Stream large datasets to avoid OOM
- **Why full load**: IskoLAR dataset expected to be moderate size (<10k records)

---

## 🔮 Future Enhancements

### 1. Email Templates
- Visual email template editor
- Preview before sending
- Store templates in `app_settings`

### 2. Scheduled Tasks
- Automatic draft cleanup (cron job)
- Scheduled maintenance mode
- Regular data exports

### 3. Advanced Audit
- Filter by date range
- Search by changed_by user
- Export audit log as CSV

### 4. Feature Flag Rollout
- Gradual rollout percentages
- A/B testing infrastructure
- Per-user feature overrides

### 5. Multi-Language Support
- i18n for settings labels
- Timezone-aware date formatting
- Locale-specific CSV exports

---

## 📖 Related Documentation

- [Admin Management Implementation](./ADMIN_MANAGEMENT_FIX_SUMMARY.md)
- [Bearer Token Auth Fix](./AUTH_FIX_BEARER_TOKENS.md)
- [RLS Policy Fix](./FIX_ADMIN_RLS_POLICY.sql)
- [Database Migration Guide](./IMPLEMENTATION_GUIDE.md)

---

## ✨ Summary

**What was implemented:**
- Complete System Settings feature for super_admin
- 7 tabbed sections: General, Email, Auth Policy, Features, Maintenance, Audit, Danger Zone
- 8 new API routes with Bearer token auth
- Password-gated destructive operations
- Double-confirmation for irreversible actions
- Rate limiting for safety
- Automatic audit logging
- CSV export for users/admins/applications
- SendGrid email testing
- Database migration with RLS policies

**What you need to do:**
1. Run `FIX_ADMIN_RLS_POLICY.sql` in Supabase SQL Editor
2. Run `20251027_app_settings.sql` in Supabase SQL Editor
3. Add `SENDGRID_API_KEY` to `.env.local` (optional, for test email)
4. Install `@sendgrid/mail` if not in package.json
5. Test all tabs in `/admin/settings`

**Next conversation:**
Let me know if you encounter any errors or need adjustments!
