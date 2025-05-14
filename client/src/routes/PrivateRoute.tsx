import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/userSlice';
import { fetchUserPermissions } from '@/store/slices/roleSlice';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentUser: userProfile } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    if (currentUser && !isLoading && !userProfile) {
      dispatch(fetchUserProfile());
    }

    if (userProfile?.id) {
      dispatch(fetchUserPermissions(userProfile.id));
    }
  }, [dispatch, currentUser, isLoading, userProfile]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  if (!currentUser) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
