import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logout());
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout failed:', error);
        navigate('/', { replace: true });
      }
    };

    performLogout();
  }, [dispatch, navigate]);

  return <LoadingScreen message="Logging out..." />;
};

export default Logout;
