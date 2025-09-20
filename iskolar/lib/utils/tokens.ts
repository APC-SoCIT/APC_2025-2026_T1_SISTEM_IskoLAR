import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface TokenData {
  userId: number | string;  // admin_id is a number
  userType: 'admin' | 'scholar';
}

export async function createResetToken(data: TokenData): Promise<string> {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Set expiry to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Store token in database
  const { error } = await supabase
    .from('password_reset_tokens')
    .insert({
      admin_id: typeof data.userId === 'string' ? parseInt(data.userId) : data.userId,  // Ensure it's a number
      token,
      user_type: data.userType,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Error creating reset token:', error);
    throw new Error('Failed to create password reset token');
  }

  return token;
}

export async function validateResetToken(token: string): Promise<TokenData | null> {
  // Get token from database
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    console.error('Error validating reset token:', error);
    return null;
  }

  return {
    userId: data.user_id,
    userType: data.user_type as 'admin' | 'scholar',
  };
}

export async function markTokenAsUsed(token: string): Promise<void> {
  const { error } = await supabase
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token);

  if (error) {
    console.error('Error marking token as used:', error);
    throw new Error('Failed to update token status');
  }
}