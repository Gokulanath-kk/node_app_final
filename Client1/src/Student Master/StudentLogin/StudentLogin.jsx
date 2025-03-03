import React, { useState } from 'react';
import herobg from '../../Asserts/Image/LoginBlurbackgroundImage.png';
import logo from '../../Asserts/Image/logo.png';
import loginLeftImage from '../../Asserts/Image/loginleftsideimage.png';
import { AlertCircle } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


const StudentLogin = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        category_code: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const [errorNotification, setErrorNotification] = useState({
        show: false,
        message: '',
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, [id]: '' });
    };

    const validateForm = () => {
        const newErrors = {};

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }


        if (!formData.password) {
            newErrors.password = 'password is required.';
        }

        if (!formData.category_code) {
            newErrors.category_code = 'Code is required.';
        }

        return newErrors;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            console.log(formData,);

            const response = await axiosInstance.post('/student/studentLogin', formData);

            if (response.data) {
                sessionStorage.setItem("userData", JSON.stringify(response.data));
                sessionStorage.removeItem("cwq_id");
                sessionStorage.removeItem("email");
                sessionStorage.removeItem("password");
                navigate('/landingIndex');
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';

            if (error.response && error.response.data) {
                errorMessage = error.response.data.message ||
                    error.response.data.error ||
                    'Registration failed';
                console.error("Server error:", errorMessage);
            } else if (error.message) {
                errorMessage = error.message;
                console.error("Error:", errorMessage);
            }

            setErrorNotification({
                show: true,
                message: errorMessage
            });

            setTimeout(() => {
                setErrorNotification({ show: false, message: '' });
            }, 5000);
        }
    };

    const ErrorNotification = () => {
        if (!errorNotification.show) return null;

        return (
            <div className="fixed top-4 right-4 z-50 w-96 p-4">
                <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 transform transition-all duration-300 ease-out translate-x-0 opacity-100">
                    <AlertCircle className="h-6 w-6 text-white" />
                    <span className="flex-1">{errorNotification.message}</span>
                    <button
                        onClick={() => setErrorNotification({ ...errorNotification, show: false })}
                        className="text-white hover:bg-red-700 rounded-full p-2 focus:outline-none"
                    >
                        <span className="text-lg">&times;</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex flex-col"
            style={{
                backgroundImage: `url(${herobg})`,
            }}
        >
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-[4.5rem]" />

                </div>
            </div>
            <div className="flex-grow flex flex-col sm:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 ">
                <div className="w-full sm:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] md:h-[500px] ">
                    <img
                        src={loginLeftImage}
                        alt="Hero"
                        className="max-w-full max-h-full object-contain z-10 relative "
                    />
                </div>
                <div className="w-full max-w-2xl mx-auto py-8 lg:py-0 px-20 xl:-mt-20 lg:-mt-20 md:-mt-20 ">
                    <h1 className="font-unbounded text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ">
                        Welcome Back!
                    </h1>
                    <p className="font-sans text-base sm:text-lg mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600">
                        Enter your credentials
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 ">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2"
                            >
                                Email Id
                            </label>
                            <input
                                type="text"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-1 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 
                        transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                        ${errors.email ? 'border-red-500' : 'border-purple-300'}`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
            focus:outline-none focus:ring-2 focus:border-transparent 
            transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
            ${errors.password ? "border-red-500" : "border-purple-300"}`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                                >
                                    {showPassword ? <FaEyeSlash/> : <FaEye/>}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="category_code"
                                className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2"
                            >
                                Enter Code
                            </label>
                            <input
                                type="text"
                                id="category_code"
                                value={formData.category_code}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-1 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 
                        transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                        ${errors.category_code ? 'border-red-500' : 'border-purple-300'}`}
                                placeholder="Enter the code"
                            />
                            {errors.category_code && (
                                <p className="text-xs text-red-500 mt-1">{errors.category_code}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-fuchsia-600 text-white py-2 sm:py-3 rounded-lg text-xs sm:text-base font-medium hover:bg-fuchsia-800 transition duration-300 ease-in-out"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
            <ErrorNotification />
        </div>
    );
};

export default StudentLogin;
