import React, { useState, useEffect } from 'react';
import illustration from '../../Asserts/Image/studentRegisterleft.png';
import { AlertCircle, ChevronDownIcon } from 'lucide-react';
import axiosInstance from "../../axiosInstance";
import { MdContentCopy } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const StudentRegistration = () => {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState([])
  const [coursecategory, setCourseCategory] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
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


  console.log(courseDetails , "courseDaills");
  

  const departments = ['Computer Science', 'Mechanical', 'Civil'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const email = sessionStorage.getItem('email');
  const phone_number = sessionStorage.getItem('phone_number');


  const fetchCourseCategories = () => {
    axiosInstance.get('/newcourse/coursedeatails')
      .then((response) => {
        setCourseCategory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching course category:", error);
      });
  };

  const fetchCoursewithQuizCode = async () => {
    try {
      const courseId = sessionStorage.getItem('cwq_id');
    console.log(courseId , "cwq_id Id")

      if (courseId) {
        const courseResponse = await axiosInstance.get(`/newcourse/view/${courseId}`);
        const course = courseResponse.data;
        console.log('Course details:', course);

        setCourseDetails(course); 
        console.log(courseDetails)
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching course:', error);

    }
  };


  useEffect(() => {
    fetchCoursewithQuizCode()
    fetchCourseCategories();
  }, []);

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

    console.log(formData , "FormData");
    

    try {
      const response = await axiosInstance.post('/student/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        sessionStorage.setItem('cwq_id', formData.cwq_id);
        sessionStorage.setItem('email', formData.email);
        sessionStorage.setItem('phone_number', formData.mobile);
        await fetchCoursewithQuizCode();
        setFormData({
          name: '',
          mobile: '',
          email: '',
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
    navigator.clipboard.writeText(course.course_quiz_code)
      .then(() => {
        setCopiedCourse(course.cwq_id);
        setTimeout(() => setCopiedCourse(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

const handlelogin = () => {
  navigate("/login")
}

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


  const openCourseModal = () => {
    if (!courseDetails || courseDetails.length === 0) return null;

    return (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 ">
          <div className="fixed inset-0 transition-opacity  backdrop-blur-sm z-0" aria-hidden="true">
            <div className="absolute inset-0  opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-gradient-to-b from-purple-400 to-pink-400 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Course Details</h3>
                <div className="mt-2">
                  {courseDetails && courseDetails.map((course) => (
                    <div key={course.cwq_id} className="mb-4">
                      <h1 className='list-disc flex text-xl'><li>Your Username is <span className='text-white'>{email}</span></li></h1>
                      <h1 className='list-disc text-xl'><li>Your Password is <span className='text-white'>{phone_number}</span></li></h1>
                      <p className='text-center text-white text-lg'> Copy Your Code </p>

                      <div className="flex items-center justify-center space-x-2 mt-2 relative">
                        <input
                          type="text"
                          readOnly
                          value={course.category_code}
                          className="text-xl text-purple-500 bg-purple-100 rounded-md px-2 py-1 w-full text-center pr-10"
                        />
                        <button
                          onClick={() => handleCopyQuizCode(course)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-gray-400 "
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
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTimeout(() => {
                    navigate('/login');
                  }, 1000)
                }}
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
              >
                Let's login {`>`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };





  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:justify-center lg:items-center p-4 xl:p-8">
      <div className="min-h-screen flex items-center justify-center px-20">
                        <div className="border-dashed border-2 border-purple-300 rounded-3xl py-20 px-16
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
                                className="max-w-full max-h-[600px] object-contain xl:w-80
                                        transition-transform duration-500
                                        hover:scale-110
                                        hover:rotate-3
                                        will-change-transform"/>
                        </div>
                    </div>
      </div>

      <div className="flex justify-center items-center px-4 sm:px-8 md:px-16 lg:px-12 xl:px-32 mt-20">
        <div className="w-full max-w-2xl mx-auto py-8 lg:py-0 ">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Welcome!</h1>
          <p className="text-base sm:text-lg text-slate-500 mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600">Register your account</p>

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
              <div className="flex gap-1 sm:gap-2">
                <input
                  type="text"
                  value="+91"
                  readOnly
                  className="w-12 sm:w-20 px-2 py-2 sm:px-3 sm:py-3 bg-purple-200 text-black border-2 border-purple-300 rounded-l-lg text-center font-semibold text-xs sm:text-base"
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
                  <span>{formData.department || 'Select department'}</span>
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
                  <span>{formData.year || 'Select year'}</span>
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
              <label htmlFor="course" className="block text-xs sm:text-sm font-medium text-purple-700 mb-1 sm:mb-2">Course</label>
              <div className="relative">
                <div
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-200 text-black border-2 rounded-lg 
                  flex items-center justify-between cursor-pointer text-xs sm:text-base
                  ${errors.course ? 'border-red-500' : 'border-purple-300'}
                  ${dropdowns.isOpenCourse ? 'rounded-b-none' : ''}`}
                  onClick={() => toggleDropdown('isOpenCourse')}
                >
                  <span>{formData.course || 'Select course'}</span>
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
