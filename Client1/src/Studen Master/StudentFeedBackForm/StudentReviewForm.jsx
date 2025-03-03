
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, AlertCircle } from 'lucide-react';
import { MdContentCopy } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../axiosInstance";
import illustration from '../../Asserts/Image/FeedBackFromLeftPage.png';

const StudentReviewForm = () => {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseDetails, setCourseDetails] = useState(null);
    const [coursecategory, setCourseCategory] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        college: '',
        department: '',
        year: '',
        course_id: '',
        course: '',
        presentationSkills: "",
        responseToQuestions: "",
        sessionRating: "",
        interestedInCourses: "",
        interestedInInternships: "",
        technologies: [],
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

    const departments = ['Computer Science', 'Mechanical', 'Civil'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    const technologies = [
        { value: 'AWS', label: 'Amazon Web Services (AWS)' },
        { value: 'AI', label: 'Artificial Intelligence' },
        { value: 'ML', label: 'Machine Learning' },
        { value: 'DS', label: 'Data Science / Analytics' },
        { value: 'CyberSecurity', label: 'Cyber Security / Ethical Hacking' },
        { value: 'CorePython', label: 'Core Python' },
        { value: 'AdvancedPython', label: 'Advanced Python & Frameworks' },
        { value: 'CoreJava', label: 'Core JAVA' },
        { value: 'IOT', label: 'Internet of Things (IOT)' },
        { value: 'EmbeddedSystems', label: 'Embedded Systems' },
        { value: 'WebAppDevelopment', label: 'Web Application Development' },
        { value: 'FullStackDevelopment', label: 'Full Stack Development' },
        { value: 'ReactJS', label: 'React JS / Angular JS' },
        { value: 'UIUXDesign', label: 'UI/UX Design' }
    ];

    const fetchCourseCategories = () => {
        axiosInstance.get('/courses/coursecategory')
            .then((response) => {
                setCourseCategory(response.data);
            })
            .catch((error) => {
                console.error("Error fetching course category:", error);
            });
    };

    useEffect(() => {
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

        if (!formData.course_id) {
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
            ...(courseId ? { course_id: courseId } : {}),
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

    const handleTechnologyChange = (value) => {
        setFormData((prevData) => {
            const { technologies } = prevData;
            const isAlreadySelected = technologies.includes(value);
            return {
                ...prevData,
                technologies: isAlreadySelected
                    ? technologies.filter((tech) => tech !== value)
                    : [...technologies, value],
            };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log(formData, "Submitted formData");

        try {
            const response = await axiosInstance.post(
                '/reviews/studentreview',
                {
                    ...formData,
                    technologies: formData.technologies,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setIsModalOpen(true);
                setFormData({
                    name: '',
                    mobile: '',
                    email: '',
                    college: '',
                    department: '',
                    year: '',
                    course_id: '',
                    course: '',
                    presentationSkills: "",
                    responseToQuestions: "",
                    sessionRating: "",
                    interestedInCourses: "",
                    interestedInInternships: "",
                    technologies: [],
                });

                setErrors({});
                console.log("Registration successful!");
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
                message: errorMessage,
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
                <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
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

    const CourseModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity backdrop-blur-sm z-0" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <div className="inline-block align-bottom bg-gradient-to-b from-purple-400 to-pink-400 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                        <div className="flex justify-center mb-4">
                            <div className="text-5xl animate-bounce">❤️</div>
                        </div>
                        <h2 className="text-center text-xl font-bold text-white mb-10">
                            Your feedback has been submitted <br />Successfully.
                        </h2>
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                navigate(-1);
                            }}
                            type="button"
                            className=" text-5xl inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-1 py-3 bg-white text-base font-bold text-purple-600  sm:text-sm"
                        >
                            Done {`>`}
                        </button>
                    </div>

                </div>
            </div>

        );
    };


    return (
        <>
            <form onSubmit={handleSubmit} className="min-h-screen ">
                <div className='flex flex-col lg:grid lg:grid-cols-2'>
                    <div className="min-h-screen flex items-center justify-center px-20">
                        <div className="border-dashed border-2 border-purple-300 rounded-3xl p-6 xl:p-12 
                                        flex justify-center items-center 
                                        w-full max-w-4xl 
                                        shadow-2xl
                                        transform transition-all duration-700 
                                        hover:scale-105 
                                        hover:shadow-3xl
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
                    <div className='p-5'>
                        <div className="flex justify-center items-center bg-purple-200  px-5 rounded-xl py-10 sm:px-12 md:px-16 lg:px-12 xl:px-16  mt-20">
                            <div className="w-full ">
                                <div className="space-y-4 sm:space-y-5 md:space-y-6 mb-5">
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

                                    {/* College Input - Responsive */}
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
                                                            onClick={() => handleSelect('course', course.category_name, course.course_id)}
                                                        >
                                                            {course.category_name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='px-10 rounded-lg py-3'>
                    <div className='bg-purple-100 '>
                        <div className='xl:px-24 lg:px-20 md:p-16 sm:p-0 '>
                            <div className=" w-full">
                                <div className="bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Instructor Presentation Skills</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {["excellent", "good", "poor"].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="presentationSkills"
                                                    value={option}
                                                    checked={formData.presentationSkills === option}
                                                    onChange={handleChange}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructor's Response to Students' Questions */}
                                <div className="mt-5 bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Instructor's Response to Students' Questions</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {["excellent", "good", "poor"].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="responseToQuestions"
                                                    value={option}
                                                    checked={formData.responseToQuestions === option}
                                                    onChange={handleChange}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Session Rating */}
                                <div className="mt-5 bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Please provide your rating for our entire session.</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {["excellent", "good", "poor"].map((option) => (
                                            <label key={option} className="flex items-center ">
                                                <input
                                                    type="radio"
                                                    name="sessionRating"
                                                    value={option}
                                                    checked={formData.sessionRating === option}
                                                    onChange={handleChange}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Interested in Courses */}
                                <div className="mt-5 bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Would you be interested in enrolling in our COURSES?</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {["yes", "no"].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="interestedInCourses"
                                                    value={option}
                                                    checked={formData.interestedInCourses === option}
                                                    onChange={handleChange}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Interested in Internships */}
                                <div className="mt-5 bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Would you be interested in enrolling in our INTERNSHIP PROGRAMS?</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {["yes", "no"].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="interestedInInternships"
                                                    value={option}
                                                    checked={formData.interestedInInternships === option}
                                                    onChange={handleChange}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 bg-purple-200 rounded-lg p-4 px-10 py-5">
                                    <h1 className="text-xl font-semibold mb-4">Would you like to LEARN any of the following Technologies?</h1>
                                    <div className="flex flex-col items-start space-y-4">
                                        {technologies.map((tech) => (
                                            <label key={tech.value} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="technologies"
                                                    value={tech.value}
                                                    checked={formData.technologies.includes(tech.value)}
                                                    onChange={() => handleTechnologyChange(tech.value)}
                                                    className="mr-2 text-purple-600 focus:ring-purple-600"
                                                />
                                                {tech.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center mt-4 sm:mt-6 mb-2 ">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-10 sm:px-16 py-2 sm:py-3 bg-purple-600 text-white rounded-lg shadow-md 
                hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                focus:ring-offset-2 transition duration-300 ease-in-out text-sm sm:text-lg font-semibold"
                                    >
                                        SUBMIT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <ErrorNotification />
            <CourseModal />
        </>
    );
};

export default StudentReviewForm;

