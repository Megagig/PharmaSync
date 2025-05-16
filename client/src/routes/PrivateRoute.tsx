import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/userSlice';
import { fetchUserPermissions } from '@/store/slices/roleSlice';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Use refs to track if we've already dispatched the actions
  const profileFetchedRef = useRef(false);
  const permissionsFetchedRef = useRef(false);
  const redirectedRef = useRef(false);

  const { user: currentUser, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentUser: userProfile, isLoading: userLoading } = useSelector(
    (state: RootState) => state.users
  );

  // Fetch user profile only once
  useEffect(() => {
    // Only fetch if we have a user but haven't fetched profile yet
    if (currentUser && !profileFetchedRef.current && !userProfile) {
      profileFetchedRef.current = true;
      dispatch(fetchUserProfile());
    }
  }, [dispatch, currentUser, userProfile]);

  // Fetch permissions only once
  useEffect(() => {
    // Only fetch if we have a user profile with ID and haven't fetched permissions yet
    if (userProfile?.id && !permissionsFetchedRef.current) {
      permissionsFetchedRef.current = true;
      dispatch(fetchUserPermissions(userProfile.id));
    }
  }, [dispatch, userProfile]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  if (!currentUser && !redirectedRef.current) {
    // Set redirected flag to prevent infinite redirects
    redirectedRef.current = true;
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
