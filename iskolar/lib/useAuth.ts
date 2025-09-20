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
 
    export const useAuth = (redirectTo?: string): UseAuthReturn => {
    const router = useRouter();
    const [user, setUser] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
 
    useEffect(() => {
        const checkAuth = async () => {
        try {
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
            if (redirectTo) {
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
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/');
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