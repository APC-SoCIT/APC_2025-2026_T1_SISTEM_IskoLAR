-- Make application details fields nullable since they'll be filled during scholarship application
ALTER TABLE public.application_details ALTER COLUMN mother_maiden_name DROP NOT NULL;
ALTER TABLE public.application_details ALTER COLUMN father_name DROP NOT NULL;
ALTER TABLE public.application_details ALTER COLUMN father_occupation DROP NOT NULL;
ALTER TABLE public.application_details ALTER COLUMN mother_occupation DROP NOT NULL;
