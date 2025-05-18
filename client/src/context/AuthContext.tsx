import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { User } from '@/types/auth.types';
import authService from '@/api/services/auth.service';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // Use a ref to track initialization state to avoid re-renders
  const initializedRef = useRef(false);
  const authAttemptedRef = useRef(false);

  useEffect(() => {
    // Only run this once
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', !!token);

      if (token && !user && !authAttemptedRef.current) {
        try {
          console.log('Attempting to fetch user data with existing token');
          authAttemptedRef.current = true;

          // Try to get current user with the token
          const userData = await authService.getCurrentUser();
          console.log('User data fetched successfully:', userData);

          // Store user data and token in Redux
          dispatch(setCredentials({ user: userData, token }));
        } catch (error: any) {
          console.error('Failed to fetch user data:', error);

          // If token is expired, try to refresh it
          if (error.response && error.response.status === 401) {
            console.log('Token expired, attempting to refresh...');
            try {
              // Try to refresh the token
              const { accessToken } = await authService.refreshToken();

              if (accessToken) {
                console.log(
                  'Token refreshed successfully, fetching user data again'
                );
                // Try to get user data with the new token
                const userData = await authService.getCurrentUser();
                dispatch(
                  setCredentials({ user: userData, token: accessToken })
                );
              } else {
                console.error('No access token received from refresh');
                dispatch(clearCredentials());
              }
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              dispatch(clearCredentials());
            }
          } else {
            // For other errors, clear credentials
            dispatch(clearCredentials());
          }
        }
      }
    };

    initializeAuth();

    // Listen for session expiration events
    const handleSessionExpired = () => {
      console.log('Session expired event received');
      dispatch(clearCredentials());
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
