-- First, drop the existing name check constraint if it exists
ALTER TABLE semesters 
DROP CONSTRAINT IF EXISTS semesters_name_check;

-- Add date columns
ALTER TABLE semesters
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL,
ADD COLUMN IF NOT EXISTS end_date DATE NOT NULL;

-- Add a new, more permissive constraint for semester names
ALTER TABLE semesters
ADD CONSTRAINT semesters_name_check 
CHECK (name IN ('First Semester', 'Second Semester', 'Summer'));