import { authClient, fetchCSRFToken } from './clients';
import { refreshInProgress } from '../context/AuthContext';

// Add auth-specific interceptor
authClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        // AND the request is not to auth endpoints
        if (
            error.response?.status === 401 && 
            !originalRequest._retry &&
            !refreshInProgress.current &&
            !originalRequest.url.includes('/login/') &&
            !originalRequest.url.includes('/refresh/') 
        ) {
            originalRequest._retry = true;
            refreshInProgress.current = true;

            try {
                // Refresh the token
                await refreshToken();
                refreshInProgress.current = false;
                
                // Retry the original request
                return authClient(originalRequest);
            } catch (refreshError) {
                refreshInProgress.current = false;
                
                try {
                    // If refresh fails, attempt logout but don't throw if it fails
                    await logout();
                } catch (logoutError) {
                    console.error('Logout after failed refresh error:', logoutError);
                    // Continue without throwing - we still want to reject with the original error
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Login
export const login = async (username: string, password: string) => {
    await fetchCSRFToken();

    try {
        const response = await authClient.post('/login/', { username, password });

        // Check for successful login status
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.details);
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Refresh token
export const refreshToken = async () => {
    try {
        // The actual refresh token is in the cookie, not sent in request body
        const response = await authClient.post('/refresh/');
        return response.data;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};

// Check auth status
export const checkAuthStatus = async () => {
    try {
        const response = await authClient.post('/verify/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Logout
export const logout = async () => {
    await fetchCSRFToken();

    try {
        const response = await authClient.post('/logout/');
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Logout from all devices
export const logoutAll = async () => {
    await fetchCSRFToken();

    try {
        const response = await authClient.post('/logout-all/');
        return response.data;
    } catch (error) {
        console.error('Logout all error:', error);
        throw error;
    }
};

export default {
    login,
    logout,
    logoutAll,
    refreshToken,
    checkAuthStatus
};