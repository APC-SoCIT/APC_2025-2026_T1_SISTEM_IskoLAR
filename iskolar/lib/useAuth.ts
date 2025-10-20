'use client';
 
    import { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import { supabase } from '@/lib/supabaseClient';
 
    interface UseAuthReturn {
    user: unknown;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    }
 
    // Helper function to get auth token from various storage locations
export const getAuthToken = (): string | null => {
    // Only run in browser environment
    if (typeof window === 'undefined') return null;
    
    // Try to get token from localStorage first
    const localToken = localStorage.getItem('authToken');
    if (localToken) return localToken;
    
    // Try sessionStorage next
    const sessionToken = sessionStorage.getItem('authToken');
    if (sessionToken) return sessionToken;
    
    // Finally try cookies
    const getCookieValue = (name: string): string | null => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };
    
    return getCookieValue('authToken');
};

export const useAuth = (redirectTo?: string): UseAuthReturn => {
    const router = useRouter();
    const [user, setUser] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
 
    useEffect(() => {
        const checkAuth = async () => {
        try {
            // First, try to get the stored token
            const token = getAuthToken();
            
            // If there's a token saved in client storage but no active session,
            // we can try to re-authenticate using the token
            if (token) {
              console.log('Found stored auth token, attempting to use it');
              // You could implement token validation here if needed
            }
            
            // Then proceed with Supabase session check
            const { data: { session }, error } = await supabase.auth.getSession();
           
            if (error) {
              console.error('Error getting session:', error);
              if (redirectTo) {
                  router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
              }
              return;
            }
 
            if (!session?.user) {
              if (redirectTo) {
                  router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
              }
              return;
            }
 
            // Verify the session is still valid
            const { error: testError } = await supabase.auth.getUser();
            if (testError) {
              console.error('Session invalid:', testError);
              await supabase.auth.signOut();
              if (redirectTo) {
                  router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
              }
              return;
            }
 
            setUser(session.user);
            setIsAuthenticated(true);
            
            // Make sure token is stored - this handles the case where user might have
            // a valid session but the token isn't saved in local storage
            if (session.access_token) {
              localStorage.setItem('authToken', session.access_token);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            if (redirectTo) {
              router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
            }
        } finally {
            setIsLoading(false);
        }
        };
 
        checkAuth();
 
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (
            event: string,
            session: { user?: unknown } | null
        ) => {
            if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setIsAuthenticated(false);
            if (window.location.pathname.startsWith('/admin')) {
                router.push('/admin-auth/signin');
            } else if (redirectTo) {
                router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
            }
            } else if (session?.user) {
            // Verify the new session is valid
            try {
                const { error: testError } = await supabase.auth.getUser();
                if (testError) {
                console.error('New session invalid:', testError);
                await supabase.auth.signOut();
                if (redirectTo) {
                    router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
                }
                return;
                }
               
                setUser(session.user);
                setIsAuthenticated(true);
                setIsLoading(false);
            } catch (authError) {
                console.error('Error verifying session:', authError);
                await supabase.auth.signOut();
                if (redirectTo) {
                router.push(`/auth/sign-in?redirectTo=${redirectTo}`);
                }
            }
            }
        }
        );
 
        return () => subscription.unsubscribe();
    }, [router, redirectTo]);
 
    const signOut = async () => {
        try {
        // Clear stored tokens
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        
        // Clear cookies if any (using httpOnly cookies would require server action)
        if (typeof document !== 'undefined') {
          document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        
        // Sign out from Supabase
        // Call the API endpoint first
        const response = await fetch('/api/admin-auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to sign out');
        }

        // Then sign out from Supabase
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        
        // Redirect based on the current path
        if (window.location.pathname.startsWith('/admin')) {
          router.push('/admin-auth/signin');
        } else {
          router.push('/auth/sign-in');
        }
        } catch (error) {
        console.error('Error signing out:', error);
        }
    };
 
    return {
        user,
        isLoading,
        isAuthenticated,
        signOut
    };
    };