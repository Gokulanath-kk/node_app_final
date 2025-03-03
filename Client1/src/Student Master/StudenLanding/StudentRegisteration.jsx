import React, { useState, useEffect, useCallback } from 'react';
import illustration from '../../Asserts/Image/studentRegisterleft.png';
import { AlertCircle, ChevronDownIcon } from 'lucide-react';
import axiosInstance from "../../axiosInstance";
import { MdContentCopy } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

const StudentRegistration = () => {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState([])
  const [coursecategory, setCourseCategory] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    email: '',
    college: '',
    department: '',
    year: '',
    cwq_id: '',
    course: '',
  });
  const [errors, setErrors] = useState({});
  const [dropdowns, setDropdowns] = useState({
    isOpenDepartment: false,
    isOpenYear: false,
    isOpenCourse: false,
  });

  const [errorNotification, setErrorNotification] = useState({
    show: false,
    message: '',
  });


  console.log(courseDetails, "courseDaills");


  const departments = ['CSE', 'AI & DS'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const email = sessionStorage.getItem('email');
  const password = sessionStorage.getItem('password');


  const fetchCourseCategories = () => {
    axiosInstance.get('/newcourse/coursedeatails')
      .then((response) => {
        setCourseCategory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching course category:", error);
      });
  };

  const fetchCoursewithQuizCode = useCallback(async () => {
    try {
      const courseId = sessionStorage.getItem('cwq_id');
      console.log(courseId, "cwq_id Id");

      if (courseId) {
        const courseResponse = await axiosInstance.get(`/newcourse/view/${courseId}`);
        const course = courseResponse.data;
        console.log('Course details:', course);

        setCourseDetails(course);
        console.log(courseDetails);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  }, [courseDetails]);
  useEffect(() => {
    fetchCoursewithQuizCode();
    fetchCourseCategories();
  }, [fetchCoursewithQuizCode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (
      !/(?=.*[a-z])/.test(formData.password) ||
      !/(?=.*[A-Z])/.test(formData.password) ||
      !/(?=.*\d)/.test(formData.password) ||
      !/(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      newErrors.password =
        'Password must include uppercase, lowercase, number, and special character';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College name is required';
    } else if (formData.college.trim().length < 3) {
      newErrors.college = 'College name must be at least 3 characters long';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (!formData.cwq_id) {
      newErrors.course = 'Course is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelect = (field, value, courseId = null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(courseId ? { cwq_id: courseId } : {}),
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    toggleDropdown(`isOpen${field.charAt(0).toUpperCase() + field.slice(1)}`);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    console.log(formData, "FormData");


    try {
      const response = await axiosInstance.post('/student/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        sessionStorage.setItem('cwq_id', formData.cwq_id);
        sessionStorage.setItem('email', formData.email);
        sessionStorage.setItem('password', formData.password);
        await fetchCoursewithQuizCode();
        setFormData({
          name: '',
          mobile: '',
          email: '',
          password: '',
          college: '',
          department: '',
          year: '',
          cwq_id: '',
          course: '',
        });

        setErrors({});
      } else {
        throw new Error('Registration failed');
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



  const [copiedCourse, setCopiedCourse] = useState(null);

  const handleCopyQuizCode = (course) => {
    navigator.clipboard.writeText(course.category_code)
      .then(() => {
        setCopiedCourse(course.cwq_id);
        setTimeout(() => setCopiedCourse(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const handlelogin = useCallback(() => {
    setIsModalOpen(false);
   
      navigate("/login");
    
  }, [navigate]);

  useEffect(() => {
    return () => {
      setIsModalOpen(false);
    };
  }, []);


  const ErrorNotification = () => {
    if (!errorNotification.show) return null;

    return (
      <div className="fixed lg:top-4  sm:top-0 right-4 z-50 w-96 p-4">  
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


  const openCourseModal = () => {
    if (!courseDetails || courseDetails.length === 0) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />

          {/* Center modal */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

          {/* Modal content */}
          <div className="inline-block w-full transform overflow-hidden rounded-lg bg-gradient-to-b from-purple-400 to-pink-400 p-6 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-md sm:align-middle">
            {/* Icon header */}
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="mt-4">
              <h3 className="text-center text-lg font-medium text-gray-900">
                Course Details
              </h3>

              <div className="mt-4 space-y-4">
                {courseDetails.map((course) => (
                  <div key={course.cwq_id} className="rounded-lg bg-white/10 p-4">
                    <div className="space-y-2">
                      <p className="flex items-center text-xl text-gray-900">
                        <span className="mr-2">•</span>
                        Username {' '}
                        <span className="ml-2 font-medium text-white">{email}</span>
                      </p>
                      <p className="flex items-center text-xl text-gray-900">
                        <span className="mr-2">•</span>
                        Password {' '}
                        <span className="ml-2 font-medium text-white">{password}</span>
                      </p>
                    </div>

                    <p className="mt-3 text-center text-lg font-medium text-white">
                      Copy Your Code
                    </p>

                    <div className="relative mt-2">
                      <input
                        type="text"
                        readOnly
                        value={course.category_code}
                        className="w-full rounded-md bg-purple-100 py-2 px-4 text-center text-xl text-purple-500 pr-12"
                      />
                      <button
                        onClick={() => handleCopyQuizCode(course)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                        aria-label="Copy code"
                      >
                        {copiedCourse === course.cwq_id ? (
                          <span className="text-green-500">Copied!</span>
                        ) : (
                          <MdContentCopy size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer button */}
            <div className="mt-6">
              <button
                onClick={handlelogin}
                type="button"
                className="w-full rounded-md bg-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:text-sm"
              >
                Let's login {'>'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 " >
      <div className="hidden lg:flex lg:justify-center lg:items-center ">
        <div className="min-h-screen flex items-center justify-center px-20">
          <div className=" border-dashed border-2 border-purple-300 rounded-3xl xl:py-14 mt-16 
                                        items-center 
                                    
                                        shadow-2xl
                                        transform transition-all duration-700 
                                        hover:scale-105 
                                        hover:shadow-5xl
                                        shadow-purple-200
                                        animate-fade-in-up">
            <img
              src={illustration}
              alt="Illustration"
              className="w-[200px] max-h-[560px]  lg:w-full lg:h-[800px] 
                                        transition-transform duration-500
                                        hover:scale-110
                                        hover:rotate-3
                                        will-change-transform"/>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center px-4 sm:px-8 md:px-16 lg:px-12 xl:px-32 mt-20">
        <div className="w-full max-w-2xl mx-auto py-8 sm:py-0 ">
          <h1 className="font-unbounded text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 lg:mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Welcome!</h1>
          <p className="font-sans   text-base sm:text-lg text-slate-500 mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600">Register your account</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 mb-5">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  focus:outline-none focus:ring-2 focus:border-transparent 
                  transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                  ${errors.name ? 'border-red-500' : 'border-purple-300'}`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="mobile" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Mobile Number</label>
              <div className="flex ">
                <input
                  type="text"
                  value="+91"
                  readOnly
                  className="w-12 sm:w-20 px-2 text-purple-600 py-2 sm:px-3 sm:py-3 bg-purple-200 text-black border-2 border-purple-300 rounded-l-lg text-center font-semibold text-xs sm:text-base"
                />
                <input
                  type="tel"
                  id="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-r-lg 
                    focus:outline-none focus:ring-2 focus:border-transparent 
                    transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                    ${errors.mobile ? 'border-red-500' : 'border-purple-300'}`}
                  placeholder="Enter mobile number"
                  maxLength="10"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Email ID</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  focus:outline-none focus:ring-2 focus:border-transparent 
                  transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                  ${errors.email ? 'border-red-500' : 'border-purple-300'}`}
                placeholder="Enter your email id"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="college" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">College</label>
              <input
                type="text"
                id="college"
                value={formData.college}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  focus:outline-none focus:ring-2 focus:border-transparent 
                  transition duration-300 ease-in-out placeholder-purple-400 text-xs sm:text-base
                  ${errors.college ? 'border-red-500' : 'border-purple-300'}`}
                placeholder="Enter your college name"
              />
              {errors.college && <p className="text-xs text-red-500 mt-1">{errors.college}</p>}
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <label htmlFor="department" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Department</label>
                <div
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  flex items-center justify-between cursor-pointer text-xs sm:text-base
                  ${errors.department ? 'border-red-500' : 'border-purple-300'}
                  ${dropdowns.isOpenDepartment ? 'rounded-b-none' : ''}`}
                  onClick={() => toggleDropdown('isOpenDepartment')}
                >
                  <span className='text-purple-600'>{formData.department || 'Select department'}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform 
                    ${dropdowns.isOpenDepartment ? 'rotate-180' : ''}`}
                  />
                </div>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                {dropdowns.isOpenDepartment && (
                  <div className="absolute z-10 w-full bg-purple-200 text-black border-2 border-t-0 border-purple-300 rounded-b-lg shadow-lg">
                    {departments.map((dept) => (
                      <div
                        key={dept}
                        className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-purple-300 transition-colors cursor-pointer text-xs sm:text-base"
                        onClick={() => handleSelect('department', dept)}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <label htmlFor="year" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Year</label>
                <div
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  flex items-center justify-between cursor-pointer text-xs sm:text-base
                  ${errors.year ? 'border-red-500' : 'border-purple-300'}
                  ${dropdowns.isOpenYear ? 'rounded-b-none' : ''}`}
                  onClick={() => toggleDropdown('isOpenYear')}
                >
                  <span className='text-purple-600'>{formData.year || 'Select year'}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform 
                    ${dropdowns.isOpenYear ? 'rotate-180' : ''}`}
                  />
                </div>
                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
                {dropdowns.isOpenYear && (
                  <div className="absolute z-10 w-full bg-purple-200 text-black border-2 border-t-0 border-purple-300 rounded-b-lg shadow-lg">
                    {years.map((year) => (
                      <div
                        key={year}
                        className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-purple-300 transition-colors cursor-pointer text-xs sm:text-base"
                        onClick={() => handleSelect('year', year)}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="course" className="font-sans block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Course</label>
              <div className="relative">
                <div
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  flex items-center justify-between cursor-pointer text-xs sm:text-base
                  ${errors.course ? 'border-red-500' : 'border-purple-300'}
                  ${dropdowns.isOpenCourse ? 'rounded-b-none' : ''}`}
                  onClick={() => toggleDropdown('isOpenCourse')}
                >
                  <span className='text-purple-600'>{formData.course || 'Select course'}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform 
                    ${dropdowns.isOpenCourse ? 'rotate-180' : ''}`}
                  />
                </div>
                {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
                {dropdowns.isOpenCourse && (
                  <div className="absolute z-10 w-full bg-purple-200 text-black border-2 border-t-0 border-purple-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                    {coursecategory.map((course) => (
                      <div
                        key={course.category_id}
                        className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-purple-300 transition-colors cursor-pointer text-xs sm:text-base"
                        onClick={() => handleSelect('course', course.course_college_name, course.cwq_id)}
                      >
                        {course.course_college_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-4 sm:mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto px-10 sm:px-16 py-2 sm:py-3 bg-purple-600 text-white rounded-lg shadow-md 
                hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                focus:ring-offset-2 transition duration-300 ease-in-out text-sm sm:text-lg font-semibold"
              >
                SUBMIT
              </button>

            </div>

            <button
              onClick={handlelogin}
              className="mt-4 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600 px-24 text-sm sm:text-base font-medium"
            >
              Already registered? Login here.
            </button>
          </form>
        </div>
      </div>
      <ErrorNotification />
      {isModalOpen && openCourseModal()}
    </div>
  );
};

export default StudentRegistration;
