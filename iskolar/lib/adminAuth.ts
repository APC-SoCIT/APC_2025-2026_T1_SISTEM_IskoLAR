export const getAdminToken = (): string | null => {
    // Only run in browser environment
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('adminToken');
};