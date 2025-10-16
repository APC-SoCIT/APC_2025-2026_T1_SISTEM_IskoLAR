import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface TokenData {
  userId: number | string;  // user_id
  userType: 'admin' | 'user' | 'finance' | 'reviewer';  // All possible user types
}

export async function createResetToken(data: TokenData): Promise<string> {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Set expiry to 72 hours (3 days) from now to account for time differences
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72);

  // Map the user type to the database format
  // Map to valid database user_type values (only 'admin' and 'scholar' are allowed)
  const dbUserType = data.userType === 'admin' ? 'admin' : 'scholar';

  // Prepare the data based on user type
  const insertData = data.userType === 'admin' 
    ? {
        admin_id: data.userId, // Keep as UUID for admin
        user_id: null,
        token,
        user_type: dbUserType,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }
    : {
        admin_id: null,
        user_id: data.userId, // Keep as UUID for users
        token,
        user_type: dbUserType,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      };

  // First, invalidate any existing tokens for this user
  if (data.userType === 'admin') {
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('admin_id', insertData.admin_id)
      .is('used_at', null);
  } else {
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', insertData.user_id)
      .is('used_at', null);
  }

  // Now store the new token in database
  const { error } = await supabase
    .from('password_reset_tokens')
    .insert(insertData);

  if (error) {
    console.error('Error creating reset token:', error);
    throw new Error('Failed to create password reset token');
  }

  return token;
}

export async function validateResetToken(token: string): Promise<TokenData | null> {
  try {
    // Get token from database
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null) // Check if token hasn't been used
      .single();

    if (error) {
      console.error('Database error validating reset token:', error);
      return null;
    }

    if (!data) {
      console.error('No token found or token already used');
      return null;
    }

    // Check if we have user_id in the data
    // Check if we have either admin_id or user_id in the data
    if (!data.admin_id && !data.user_id) {
      console.error('No admin_id or user_id found in token data');
      return null;
    }

    // Parse the expiration date
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    // Add a 1-hour buffer to account for timezone differences
    const bufferMs = 60 * 60 * 1000; // 1 hour in milliseconds
    if (now.getTime() > (expiresAt.getTime() + bufferMs)) {
      console.error('Token has expired. Expiry:', expiresAt.toISOString(), 'Current:', now.toISOString());
      return null;
    }

    // Get the appropriate ID based on user type
    const id = data.admin_id || data.user_id;
    console.log(`Token validated successfully for ${data.admin_id ? 'admin_id' : 'user_id'}:`, id);

    // Map database user type back to API user type
    const apiUserType = data.user_type === 'admin' ? 'admin' : 'user';
    
    return {
      userId: id,
      userType: apiUserType as 'admin' | 'user' | 'finance' | 'reviewer',
    };
  } catch (err) {
    console.error('Unexpected error validating token:', err);
    return null;
  }
}

export async function markTokenAsUsed(token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      console.error('Database error marking token as used:', error);
      throw new Error('Failed to update token status');
    }

    console.log('Token marked as used successfully:', token);
  } catch (err) {
    console.error('Unexpected error marking token as used:', err);
    throw err;
  }
}