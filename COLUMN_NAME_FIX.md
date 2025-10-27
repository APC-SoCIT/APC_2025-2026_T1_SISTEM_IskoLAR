# Column Name Fix Summary

## Issue
The code was using incorrect column names when querying `school_years` and `semesters` tables:
- Used `school_year_id` instead of `id` 
- Used `semester_id` instead of `id`
- Used `year_range` instead of `academic_year`

This caused errors like:
```
column school_years.school_year_id does not exist
column semesters.semester_id does not exist
```

## Actual Database Schema

### school_years table
- Primary key: `id` (UUID)
- Display column: `academic_year` (INTEGER) - e.g., 2024, 2025
- Status: `is_current` (BOOLEAN)

### semesters table  
- Primary key: `id` (UUID)
- Foreign key: `school_year_id` (UUID) - references school_years(id)
- Display column: `name` (TEXT) - 'FIRST' or 'SECOND'
- Status: `is_current` (BOOLEAN)

### application_details table
- Has foreign keys: `school_year_id`, `semester_id` (these keep their names as FKs)

## Files Fixed

### 1. `/api/admin/settings/route.ts`
**Before:**
```typescript
.select('school_year_id, year_range, is_current')
.select('semester_id, name, is_current')
```

**After:**
```typescript
.select('id, academic_year, is_current')
.select('id, name, school_year_id, is_current')
```

### 2. `/admin/settings/page.tsx`
**Before:**
```typescript
// Fetching semesters
.select('semester_id, name, is_current, school_year:school_year_id(year_range)')

// Displaying school year
{currentSchoolYear?.year_range || 'Not set'}

// Semester dropdown
<option key={sem.semester_id} value={sem.semester_id}>
  {sem.name} (S.Y. {sem.school_year?.year_range})
</option>
```

**After:**
```typescript
// Fetching semesters
.select('id, name, is_current, school_year:school_year_id(academic_year)')

// Displaying school year
{currentSchoolYear?.academic_year || 'Not set'}

// Semester dropdown
<option key={sem.id} value={sem.id}>
  {sem.name} (S.Y. {sem.school_year?.academic_year})
</option>
```

### 3. `/api/admin/settings/danger/reset-semester/route.ts`
**Before:**
```typescript
.from('semester')
.select('semester_id, name, school_year_id, is_current')
.eq('semester_id', semesterId)
```

**After:**
```typescript
.from('semesters')
.select('id, name, school_year_id, is_current')
.eq('id', semesterId)
```

### 4. `/api/admin/settings/export/route.ts`
**Before:**
```typescript
school_year:school_year_id (year_range)
school_year: app.school_year?.year_range
```

**After:**
```typescript
school_year:school_year_id (academic_year)
school_year: app.school_year?.academic_year
```

## Important Notes

1. **Foreign Key Columns Keep Their Names**
   - In `application_details`, `semesters`, and other tables, foreign key columns like `school_year_id` and `semester_id` remain unchanged
   - Only the PRIMARY KEY columns in `school_years` and `semesters` are named `id`

2. **Display Format**
   - School years display as integers: `2024`, `2025`
   - Not ranges like `2024-2025` (that column doesn't exist)

3. **is_current Column**
   - Both tables should have an `is_current` boolean column
   - If missing, run `VERIFY_SCHEMA.sql` to check

4. **Related Files Not Changed**
   - Files that query `application_details.school_year_id` and `application_details.semester_id` are correct
   - Only direct queries to `school_years` and `semesters` tables needed updates

## Verification Steps

1. Run `VERIFY_SCHEMA.sql` in Supabase SQL Editor to confirm schema
2. Refresh `/admin/settings` page
3. Check that "Current Academic Period" displays correctly
4. Verify browser console shows no more column errors

## Next Steps

If `is_current` column doesn't exist, you'll need to add it via migration:

```sql
-- Add is_current to school_years
ALTER TABLE school_years 
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Add is_current to semesters
ALTER TABLE semesters 
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Set one school year as current
UPDATE school_years 
SET is_current = TRUE 
WHERE academic_year = 2024; -- Update with actual year

-- Set one semester as current
UPDATE semesters 
SET is_current = TRUE 
WHERE name = 'FIRST' 
  AND school_year_id = (SELECT id FROM school_years WHERE is_current = TRUE);
```
