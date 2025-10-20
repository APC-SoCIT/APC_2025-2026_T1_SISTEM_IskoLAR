-- Query to check the constraints on the semesters table
SELECT conname as constraint_name,
       pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'semesters'::regclass;