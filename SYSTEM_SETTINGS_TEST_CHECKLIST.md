# System Settings Testing Checklist

## ✅ General Tab
- [ ] School Year displays correctly (from `is_active` column)
- [ ] Semester displays correctly (from `applications_open` column)
- [ ] Site Name can be changed and saves
- [ ] Timezone can be changed and saves
- [ ] Date Format can be changed and saves
- [ ] Success message appears after saving

## ✅ Email Tab
- [ ] FROM Email shows: iskolar.learnersaidresource@gmail.com (read-only, grayed out)
- [ ] Display Name shows: IskoLAR Support
- [ ] Email Provider shows: SendGrid
- [ ] Info box explains configuration is from .env
- [ ] Test email recipient field is editable
- [ ] "Send Test Email" button is enabled when email is entered
- [ ] Test email sends successfully and arrives in inbox
- [ ] Success message appears after sending test email

## ✅ Auth Policy Tab
- [ ] Password requirements display correctly (read-only)
- [ ] Minimum Length shows: 8 characters
- [ ] All requirements show correct Yes/No values
- [ ] Admin Signups setting displays
- [ ] Info box explains these are Supabase-managed

## ✅ Features Tab
- [ ] **Open Applications** toggle works
  - Click toggles between Enabled/Disabled
  - Button color changes (green when enabled, gray when disabled)
  - Button shows "..." while saving
  - Success message appears after save
  - Refresh page - setting persists
  
- [ ] **Allow Application Deletion** toggle works
  - Same behavior as above
  
- [ ] **AI Document Verification** toggle works
  - Same behavior as above

- [ ] All three toggles can be changed independently
- [ ] Changes appear in Audit Log tab

## ✅ Maintenance Tab
- [ ] Maintenance Mode toggle works
  - Toggles between Active/Inactive
  - Button color changes (orange when active, gray when inactive)
  - Saves automatically
  
- [ ] Maintenance Message textarea is editable
- [ ] "Save Maintenance Settings" button saves message
- [ ] Success message appears after saving
- [ ] Changes appear in Audit Log tab

## ✅ Audit Log Tab
- [ ] Table displays with 5 columns (Timestamp, Changed By, Setting Key, Old Value, New Value)
- [ ] Shows "No audit logs yet" if empty
- [ ] After making changes, new rows appear
- [ ] Timestamps show in Philippine time (Asia/Manila)
- [ ] Changed By shows your email
- [ ] Old/New values show as formatted JSON

## ✅ Danger Zone Tab

### Purge Inactive Users
- [ ] Inactive Days field accepts numbers (minimum 30)
- [ ] Password field is present
- [ ] Confirmation text field requires "DELETE"
- [ ] Button is disabled until "DELETE" is typed
- [ ] Button shows "Purging..." while processing
- [ ] Success/error message appears after operation

### Delete Old Draft Applications
- [ ] Older Than (Days) field accepts numbers (minimum 7)
- [ ] Password field is present
- [ ] Confirmation text field requires "DELETE"
- [ ] Button is disabled until "DELETE" is typed
- [ ] Button shows "Deleting..." while processing
- [ ] Success/error message appears after operation

### Reset Semester
- [ ] Semester dropdown populates with semesters (excluding open ones)
- [ ] Shows semester name and school year
- [ ] Password field is present
- [ ] Confirmation text field requires "DELETE"
- [ ] Button is disabled until semester selected and "DELETE" typed
- [ ] Button shows "Resetting..." while processing
- [ ] Success/error message appears after operation

### Export Data
- [ ] "Export Users (CSV)" button downloads CSV file
- [ ] "Export Admins (CSV)" button downloads CSV file
- [ ] "Export Applications (CSV)" button downloads CSV file
- [ ] Files open correctly in Excel/Sheets
- [ ] Data is correctly formatted

## 🔍 Additional Checks

### Navigation
- [ ] All 7 tabs switch correctly
- [ ] Active tab is highlighted
- [ ] No console errors when switching tabs

### State Persistence
- [ ] After saving settings, refresh page
- [ ] All saved settings persist and display correctly
- [ ] Toggle states match what was saved

### Error Handling
- [ ] If API fails, error message displays
- [ ] If unauthorized, appropriate error shows
- [ ] Network errors are handled gracefully

### Performance
- [ ] Page loads quickly
- [ ] Toggle switches respond immediately
- [ ] Save operations complete in < 2 seconds
- [ ] No lag when switching tabs

### Security
- [ ] Only super_admin role can access /admin/settings
- [ ] Danger zone operations require password
- [ ] Danger zone operations require confirmation text
- [ ] Bearer token is sent with all API requests

## 🐛 Known Issues to Watch For
- [ ] If "Current Academic Period: Not set" - run CHECK_ACTIVE_PERIOD.sql to verify data
- [ ] If email test fails - check SENDGRID_API_KEY and EMAIL_FROM in .env
- [ ] If audit log is empty - it's normal until you make your first change
- [ ] If toggles don't save - check browser console for API errors

## 📝 Test Results

### Date Tested: _________________
### Tested By: _________________

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Overall Status:** ✅ Pass / ❌ Fail / ⚠️ Partial

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
