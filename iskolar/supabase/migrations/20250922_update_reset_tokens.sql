-- Drop the old table
DROP TABLE IF EXISTS password_reset_tokens;

-- Create new table with separate columns for admin and user IDs
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    admin_id INTEGER REFERENCES admin(admin_id),
    user_id UUID REFERENCES users(user_id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'scholar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure only one ID field is set
    CONSTRAINT check_single_id CHECK (
        (admin_id IS NOT NULL AND user_id IS NULL) OR
        (admin_id IS NULL AND user_id IS NOT NULL)
    )
);

-- Create index on token for faster lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Grant permissions
GRANT ALL ON password_reset_tokens TO postgres;
GRANT ALL ON password_reset_tokens TO authenticated;
GRANT ALL ON password_reset_tokens TO service_role;