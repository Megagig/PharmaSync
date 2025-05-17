import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button/Button';
import axiosInstance from '@/api/axios.config';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  // Watch password changes to validate in real-time
  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasMinLength: password.length >= 8,
      });
    }
  }, [password]);

  // Verify token validity
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        await axiosInstance.get(`/auth/verify-reset-token/${token}`);
        setIsTokenValid(true);
      } catch (error) {
        console.error('Invalid or expired token:', error);
        setIsTokenValid(false);
        toast.error('Password reset link is invalid or has expired');
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Reset token is missing');
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password`, {
        token,
        password: data.password,
      });
      
      toast.success('Password has been reset successfully');
      navigate('/login', { state: { message: 'Your password has been reset. You can now log in with your new password.' } });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              The password reset link is invalid or has expired.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="New Password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    validate: {
                      hasUppercase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                      hasLowercase: (value) => /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                      hasSpecialChar: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least one special character',
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              
              {/* Password requirements indicator */}
              {password && (
                <div className="mt-2 text-xs space-y-1">
                  <p className="font-medium text-gray-700">Password requirements:</p>
                  <ul className="pl-5 space-y-1">
                    <li className={passwordRequirements.hasMinLength ? 'text-green-600' : 'text-gray-500'}>
                      {passwordRequirements.hasMinLength ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordRequirements.hasUppercase ? '✓' : '○'} At least one uppercase letter
                    </li>
                    <li className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordRequirements.hasLowercase ? '✓' : '○'} At least one lowercase letter
                    </li>
                    <li className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                      {passwordRequirements.hasSpecialChar ? '✓' : '○'} At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'The passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Reset Password
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
