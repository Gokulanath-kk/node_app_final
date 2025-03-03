import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import herobg from '../../Asserts/Image/LoginBlurbackgroundImage.png';
import logo from '../../Asserts/Image/logo.png';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const AdminLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      email: !formData.email
        ? "Email is required"
        : !/\S+@\S+\.\S+/.test(formData.email)
          ? "Invalid email format"
          : "",
      password: !formData.password
        ? "Password is required"
        : !/^(?=.*[A-Z])(?=.*\d)(?=.*[@])[A-Za-z\d@]{6,}$/.test(formData.password)
          ? "Password must contain at least one uppercase letter, one number, and one special character (@)"
          : "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const response = await axiosInstance.post('/admin/login', formData);
      if (response.data) {
        sessionStorage.setItem("Admin", JSON.stringify(response.data));
        navigate("/admin")
      }
      sessionStorage.setItem('token', response.data.token);
    } catch (error) {
      navigate("/adminlogin")
      
      console.error('Login failed:', error.response?.data || error.message);
      setServerError(error.response?.data?.message || 'Something went wrong.');
      
    } 
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: `url(${herobg})`,
      }}
    >
      <div className="flex items-center justify-between p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-[4.5rem]" />
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="mt-1 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1">
                Email Id
              </label>
              <input
                type="text"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-purple-200 text-black rounded-lg border ${errors.email ? 'border-red-500' : 'border-purple-300'} focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 placeholder-purple-400`}
                placeholder="Admin user"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-purple-200 text-black rounded-lg border ${errors.password ? 'border-red-500' : 'border-purple-300'} focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {serverError && <p className="text-xs text-red-500 mt-1">{serverError}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-800 transition duration-300"
              
            >
        submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
