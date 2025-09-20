-- Reset the password_reset_tokens table
DROP TABLE IF EXISTS password_reset_tokens;

-- Create new table with correct schema
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    admin_id INTEGER REFERENCES admin(admin_id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'scholar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on token for faster lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Grant necessary permissions
GRANT ALL ON password_reset_tokens TO postgres;
GRANT ALL ON password_reset_tokens TO authenticated;
GRANT ALL ON password_reset_tokens TO service_role;