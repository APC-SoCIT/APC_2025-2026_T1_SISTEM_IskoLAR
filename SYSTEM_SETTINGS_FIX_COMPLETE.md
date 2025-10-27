# System Settings Fix - Complete Summary

## Problems Identified

### 1. API Key Error
```
"No API key found in request","hint":"No `apikey` request header or url param was found."
```
**Cause:** Using `supabase` client instead of `supabaseAdmin` on server-side routes.

### 2. Column Does Not Exist Errors
```
column school_years.school_year_id does not exist
column semesters.semester_id does not exist
```
**Cause:** Code was using `school_year_id` and `semester_id` as primary keys, but the actual primary key columns are named `id`.

### 3. Wrong Column Names for Current Period
The queries were looking for `is_current` column, but should use:
- `is_active` for school_years (already exists)
- `applications_open` for semesters (already exists)

## Solutions Applied

### 1. Column Name Fixes

#### Changed in 4 files:

**app/api/admin/settings/route.ts**
- `school_year_id` → `id`
- `semester_id` → `id`
- `year_range` → `academic_year`

**app/admin/settings/page.tsx**
- `semester_id` → `id` (in select and map keys)
- `year_range` → `academic_year`

**app/api/admin/settings/danger/reset-semester/route.ts**
- `semester_id` → `id`
- `from('semester')` → `from('semesters')` (also fixed table name)

**app/api/admin/settings/export/route.ts**
- `year_range` → `academic_year` (in select and mapping)

### 2. New Migration Created

**NO MIGRATION NEEDED** - We're using existing columns:
- `is_active` in school_years (already exists from migration 20251023)
- `applications_open` in semesters (already exists from migration 20251019)

## Database Schema Reference

### school_years
```sql
id UUID PRIMARY KEY (not school_year_id)
academic_year INTEGER (not year_range)
is_active BOOLEAN (use this for "current" school year)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### semesters
```sql
id UUID PRIMARY KEY (not semester_id)
school_year_id UUID (foreign key to school_years.id)
name TEXT ('FIRST' or 'SECOND')
applications_open BOOLEAN (use this for "current" semester)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### application_details (unchanged)
```sql
application_id UUID PRIMARY KEY
school_year_id UUID (foreign key - name stays as is)
semester_id UUID (foreign key - name stays as is)
...
```

## Next Steps

### 1. No Migration Needed!
The columns already exist in your database, so you can simply:

### 2. Verify Data Exists
Run this in Supabase SQL Editor to check:
```sql
-- Check active school year
SELECT id, academic_year, is_active FROM school_years WHERE is_active = true;

-- Check semester with open applications
SELECT id, name, applications_open FROM semesters WHERE applications_open = true;
```

### 3. Test the System Settings Page
1. Refresh `/admin/settings` page
2. Check "Current Academic Period" section
3. Should now display:
   - **School Year:** 2024 (or whatever year has is_active = true)
   - **Semester:** FIRST or SECOND (whichever has applications_open = true)

### 4. Verify No Console Errors
Open browser console (F12) and confirm:
- No "column does not exist" errors
- No "No API key found" errors
- Successful API responses

## Important Notes

1. **Foreign Keys Keep Their Names**
   - In `application_details` and other tables, columns like `school_year_id` and `semester_id` remain unchanged
   - Only the PRIMARY KEY columns in `school_years` and `semesters` are named `id`

2. **Display Format Changed**
   - Before: Expected `year_range` like "2024-2025"
   - After: Uses `academic_year` integer like "2024"

3. **Current Period Logic**
   - Active school year = `is_active = true` in school_years table
   - Current semester = `applications_open = true` in semesters table
   - Only ONE school year can have `is_active = true` (enforced by unique index)
   - Only ONE semester can have `applications_open = true` at a time

4. **No Migration Required**
   - All columns already exist in the database
   - Just using the correct column names now

## Files Modified

1. ✅ `app/api/admin/settings/route.ts` - Changed to use `is_active` and `applications_open`
2. ✅ `app/admin/settings/page.tsx` - Updated to use `applications_open` 
3. ✅ `app/api/admin/settings/danger/reset-semester/route.ts` - Changed to use `applications_open`
4. ✅ `app/api/admin/settings/export/route.ts` - Fixed year_range to academic_year
5. ❌ ~~`iskolar/supabase/migrations/20251028_add_is_current.sql`~~ - DELETED (not needed)

## Testing Checklist

- [ ] Verify data exists: Run query to check `is_active` and `applications_open` values
- [ ] Refresh System Settings page
- [ ] Confirm current academic period displays correctly
- [ ] Check browser console for errors
- [ ] Test changing a setting (e.g., site name)
- [ ] Verify audit log records the change
- [ ] Test semester dropdown in Danger Zone (should show correct years)

## Rollback Plan (if needed)

If something goes wrong, just revert the 4 files to use `is_current` instead of `is_active`/`applications_open`.
