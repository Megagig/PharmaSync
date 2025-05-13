import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !user) {
        try {
          const userData = await authService.getCurrentUser();
          dispatch(setCredentials({ user: userData, token }));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          dispatch(clearCredentials());
        }
      }
      
      setInitialized(true);
    };

    initializeAuth();
  }, [dispatch, user]);

  if (!initialized && isLoading) {
    // You could return a loading spinner here
    return <div>Loading...</div>;
  }

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
