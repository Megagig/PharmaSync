import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '@/store/slices/authSlice';
import Button from '@/components/common/Button/Button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await dispatch(forgotPassword(email));
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a password reset link to {email}
        </p>
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
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Reset your password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Send reset link
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
