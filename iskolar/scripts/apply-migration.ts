import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  // Create new table with correct schema
  const { error: createError } = await supabase.rpc('exec', {
    query: `
      CREATE TABLE IF NOT EXISTS new_password_reset_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) NOT NULL UNIQUE,
        admin_id INTEGER REFERENCES admin(admin_id),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'scholar')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Drop the old table if it exists
      DROP TABLE IF EXISTS password_reset_tokens;

      -- Rename the new table
      ALTER TABLE new_password_reset_tokens RENAME TO password_reset_tokens;

      -- Create index on token for faster lookups
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
    `
  });

  if (createError) {
    console.error('Error creating table:', createError);
    process.exit(1);
  }

  console.log('Migration applied successfully');
  process.exit(0);
}

applyMigration();