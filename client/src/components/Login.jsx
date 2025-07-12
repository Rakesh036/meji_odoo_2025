import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    petName: ''
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login response:', response.data.user._id);
      localStorage.setItem('userId', response.data.user._id);

      window.dispatchEvent(new Event('authChange'));
      
      setMessage('Login successful!');
      console.log('User data:', response.data.user.isAdmin);
      if(response.data.user.availability
.isAdmin) {
        navigate('/admin');
      }
      else {
      setTimeout(() => {
        navigate('/home');
      }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending forgot password request with data:', forgotPasswordData);
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', forgotPasswordData);
      console.log('Forgot password response:', response.data);
      setMessage('Pet name verified successfully! Please enter your new password.');
      setShowPasswordReset(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Pet name verification failed';
      setError(errorMessage);
      
      // If user not found, show additional help
      if (errorMessage.includes('No account found')) {
        setError(`${errorMessage} If you don't have an account, please register first.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const resetData = {
        email: forgotPasswordData.email,
        petName: forgotPasswordData.petName,
        newPassword,
        confirmPassword
      };
      
      console.log('Sending password reset request with data:', resetData);
      console.log('Request data type:', typeof resetData);
      console.log('Request data stringified:', JSON.stringify(resetData));
      const response = await axios.post('http://localhost:5001/api/auth/reset-password', resetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Password reset response:', response.data);
      
      setMessage('Password reset successfully! Logging you in...');
      
      // Auto-login after password reset
      setTimeout(async () => {
        try {
          const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: forgotPasswordData.email,
            password: newPassword
          });
          
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          
          // Dispatch custom event to notify navbar
          window.dispatchEvent(new Event('authChange'));
          
          navigate('/home');
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          setError('Password reset successful but auto-login failed. Please login manually.');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Password reset error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#493628]">Login</h2>
        
        {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#AB886D] text-white py-2 px-4 rounded-md hover:bg-[#493628] transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#AB886D] hover:text-[#493628] text-sm"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#AB886D] hover:text-[#493628] font-medium">
                Sign up
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center text-[#493628]">Forgot Password</h3>
            
            {!showPasswordReset ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    name="petName"
                    value={forgotPasswordData.petName}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#AB886D] text-white py-2 px-4 rounded-md hover:bg-[#493628] transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Pet Name'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-[#AB886D] hover:text-[#493628] text-sm"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#AB886D] text-white py-2 px-4 rounded-md hover:bg-[#493628] transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setMessage('');
                  }}
                  className="w-full text-[#AB886D] hover:text-[#493628] text-sm"
                >
                  Back to Pet Name Verification
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 