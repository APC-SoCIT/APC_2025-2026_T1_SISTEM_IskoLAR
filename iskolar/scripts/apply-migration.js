const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    // Drop the old table if it exists
    const { error: dropError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .neq('id', 0); // This is just to trigger the DELETE operation

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('Error dropping old table:', dropError);
      process.exit(1);
    }

    // Create new table with correct schema
    const { error: createError } = await supabase.rpc('create_reset_tokens_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          token VARCHAR(255) NOT NULL UNIQUE,
          admin_id INTEGER REFERENCES admin(admin_id),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE,
          user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'scholar')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      `
    });

    if (createError) {
      console.error('Error creating table:', createError);
      process.exit(1);
    }

    console.log('Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();