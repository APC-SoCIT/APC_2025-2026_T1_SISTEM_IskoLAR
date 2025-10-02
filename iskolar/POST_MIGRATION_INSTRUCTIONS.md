# Post-Migration Instructions

After you run the database migration to add the `year_level` and `gpa` columns, follow these steps to restore full functionality:

## Step 1: Run the Database Migration

In your Supabase SQL Editor, run the following SQL:

```sql
-- Add missing columns to users table for student profile information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS year_level TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gpa TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.users.year_level IS 'Student year level (e.g., 1st Year, 2nd Year, etc.)';
COMMENT ON COLUMN public.users.gpa IS 'Student Grade Point Average';
```

## Step 2: Update API Route

In `app/api/profile/update/route.ts`:

### Uncomment these lines in the userUpdateData object (around line 142):
```typescript
// Change this:
// year_level: userData.yearLevel || null,
// gpa: userData.gpa || null,

// To this:
year_level: userData.yearLevel || null,
gpa: userData.gpa || null,
```

### Uncomment these lines in fieldMappings (around line 98):
```typescript
// Change this:
// yearLevel: 'year_level',
// gpa: 'gpa'

// To this:
yearLevel: 'year_level',
gpa: 'gpa'
```

### Update response mappings (around lines 209 and 317):
```typescript
// Change this:
yearLevel: '', // updatedProfile.year_level || '',
gpa: '', // updatedProfile.gpa || '',

// To this:
yearLevel: updatedProfile.year_level || '',
gpa: updatedProfile.gpa || '',
```

## Step 3: Update Frontend

In `app/scholar/profile/page.tsx`:

### Uncomment the Year Level and GPA fields (around line 885):
Remove the comment block around the Year Level and GPA form fields.

## Step 4: Test

1. Restart your development server
2. Test profile updates with Year Level and GPA fields
3. Verify the fields are saved and loaded correctly

---

**Note**: The profile update functionality will work for all other fields even without these migrations. The Year Level and GPA fields are optional additions.