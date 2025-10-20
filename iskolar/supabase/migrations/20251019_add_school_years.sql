-- Drop and recreate school years table
DROP TABLE IF EXISTS school_years CASCADE;
CREATE TABLE school_years (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop and recreate semesters table
DROP TABLE IF EXISTS semesters CASCADE;
CREATE TABLE semesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_year_id UUID REFERENCES school_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (name IN ('FIRST', 'SECOND', 'SUMMER')),
    applications_open BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_school_years_year ON school_years(academic_year);
CREATE INDEX idx_semesters_school_year ON semesters(school_year_id);
CREATE INDEX idx_semesters_app_open ON semesters(applications_open);

-- RLS Policies for school_years
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON school_years
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert/update/delete for admins only" ON school_years
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- RLS Policies for semesters
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON semesters
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert/update/delete for admins only" ON semesters
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- RLS Policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own applications" ON applications
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Enable update/delete for admins only" ON applications
    FOR ALL
    TO authenticated-- Drop and recreate school years table
DROP TABLE IF EXISTS school_years CASCADE;
CREATE TABLE school_years (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop and recreate semesters table
DROP TABLE IF EXISTS semesters CASCADE;
CREATE TABLE semesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_year_id UUID REFERENCES school_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (name IN ('FIRST', 'SECOND', 'SUMMER')),
    applications_open BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_school_years_year ON school_years(academic_year);
CREATE INDEX idx_semesters_school_year ON semesters(school_year_id);
CREATE INDEX idx_semesters_app_open ON semesters(applications_open);

-- RLS Policies for school_years
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON school_years
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert/update/delete for admins only" ON school_years
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- RLS Policies for semesters
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON semesters
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert/update/delete for admins only" ON semesters
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- RLS Policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for own applications" ON applications
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Enable update/delete for admins only" ON applications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_school_years_updated_at
    BEFORE UPDATE ON school_years
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at
    BEFORE UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_school_years_updated_at
    BEFORE UPDATE ON school_years
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at
    BEFORE UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();