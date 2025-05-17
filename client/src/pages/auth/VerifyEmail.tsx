import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { verifyEmail, resendEmailVerification } from '@/store/slices/authSlice';
import Button from '@/components/common/Button/Button';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await dispatch(verifyEmail(token));
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      setError('No email address found. Please log in again.');
      return;
    }
    
    setIsResending(true);
    setError('');
    setSuccess('');
    
    try {
      await dispatch(resendEmailVerification(user.email));
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (token) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verifying your email
        </h2>
        
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="mt-6">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify your email
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        We've sent a verification email to your inbox. Please check your email and click the verification link.
      </p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={handleResendVerification}
          isLoading={isResending}
        >
          Resend verification email
        </Button>
      </div>
      
      <div className="mt-6">
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
