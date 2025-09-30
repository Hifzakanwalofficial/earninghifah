import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Importing icons for show/hide
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Define API endpoints
    const adminLoginUrl = 'https://expensemanager-production-4513.up.railway.app/api/admin/login';
    const driverLoginUrl = 'https://expensemanager-production-4513.up.railway.app/api/driver/login';

    try {
      // Try admin login first
      let response = await fetch(adminLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        if (!token) {
          throw new Error('No token received from server.');
        }

        localStorage.setItem('authToken', token);
        toast.success('Admin login successful!'); // Show success toast
        setFormData({ email: '', password: '' });
        navigate('/admin/list');
        return;
      }

      // If admin login fails, try driver login
      response = await fetch(driverLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log in.');
      }

      const data = await response.json();
      const token = data.token;
      if (!token) {
        throw new Error('No token received from server.');
      }

      localStorage.setItem('authToken', token);
      toast.success('Driver login successful!'); // Show success toast
      setFormData({ email: '', password: '' });
      navigate('/driver/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to log in. Please check your credentials and try again.');
      toast.error(error.message || 'Failed to log in. Please check your credentials and try again.'); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
      <h2 className="text-[32px] robotosemibold text-center ">
        Welcome Back
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Secure access to your dashboard
      </p>
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-[24px] text-center mb-0 robotosemibold text-gray-700">Sign in</h3>
          <p className="text-sm text-gray-500 text-center">Use your credentials to log in</p>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email 
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-1 p-2 w-full border border-[#E6E6E6] rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E6E6E6]"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-1 p-2 w-full border border-[#E6E6E6] rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E6E6E6]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0078BD] text-white p-2 rounded-md hover:bg-blue-800 transition-colors mt-4 disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <ToastContainer /> {/* Add ToastContainer for displaying toasts */}
    </div>
  );
};

export default Login;