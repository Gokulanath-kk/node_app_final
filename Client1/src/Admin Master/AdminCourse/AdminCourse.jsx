import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, AlertCircle, X } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import AdminAddCourse from './AdminAddCourse';
import Slate from '../AdminDashboard/Slate';
import AdminUpdateCourse from './AdminUpdateCourse';

const AdminCourse = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourseWithQuiz, setFilteredCourseWithQuiz] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [courseWithQuiz, setCourseWithQuiz] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [openUpdate, setOpenUpdate] = useState(false);
    const [updateData, setUpdateData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletedCourseId, setDeletedCourseId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);


    const fetchCourseWithQuiz = async () => {
        try {
            const response = await axiosInstance.get('/newcourse/coursedeatails');
            setCourseWithQuiz(response.data);
        } catch (error) {
            console.error('Error fetching course data:', error);
            setAlert({
                show: true,
                type: 'error',
                message: 'Failed to fetch courses'
            });
        }
    };

    const getAuthToken = () => {
        return sessionStorage.getItem('token');
    };

    const fetchCourses = async () => {

        try {
            const token = getAuthToken();

            const res = await axiosInstance.get("/courses/CourseData",

                {
                    headers: {
                        Authorization: `Bearer ${token} `
                    }
                }

            );
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchSubCategory = useCallback(async () => {
        axiosInstance.get("/catagory/category").then((res) => {
            setSubCategory(res.data);
        }).catch((err) => {
            console.log(err, "result");
        });
    }, []);

    useEffect(() => {
        const filtered = courseWithQuiz.filter(course => {
            const searchLower = searchTerm.toLowerCase().trim();

            const relatedCourse = courses.find(c => c.course_id === course.course_id);
            const relatedSubCategory = subCategory.find(c => c.category_id === course.category_id);

            const courseNameMatch = relatedCourse?.course_name?.toLowerCase().includes(searchLower) || false;

            const subCategoryMatch = relatedSubCategory?.category_name?.toLowerCase().includes(searchLower) || false;

            const courseCollegeNameMatch = course.course_college_name?.toLowerCase().includes(searchLower) || false;
            const questionsTypeMatch = course.questions_type?.toLowerCase().includes(searchLower) || false;
            const categoryCodeMatch = course.category_code?.toLowerCase().includes(searchLower) || false;
            const noOfQuestionsMatch = course.no_of_questions?.toString().includes(searchLower) || false;

            return courseNameMatch ||
                subCategoryMatch ||
                courseCollegeNameMatch ||
                questionsTypeMatch ||
                categoryCodeMatch ||
                noOfQuestionsMatch;
        });

        setFilteredCourseWithQuiz(filtered);
    }, [searchTerm, courseWithQuiz, courses, subCategory]);


    useEffect(() => {
        fetchCourses();
        fetchSubCategory();
        fetchCourseWithQuiz();
    }, []);

    const handleAddCourses = () => {
        fetchCourses()
        fetchCourseWithQuiz()
        setShowAddModal(true);
    };

    const handleClose = () => {
        fetchCourses()
        setShowAddModal(false);
    };


    const handleView = async (cwq_id) => {
        try {
            const response = await axiosInstance.get(`/newcourse/view/${cwq_id}`);
            if (response.data && response.data.length > 0) {
                setSelectedTopic(response.data[0]);
                setShowViewModal(true);
            } else {
                setAlert({
                    show: true,
                    type: 'error',
                    message: ' coursewithquiz not found'
                });
            }
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: 'Faild get coursewithquiz'
            });
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/newcourse/delete/${deletedCourseId}`);
            setAlert({
                show: true,
                type: 'success',
                message: 'Course deleted successfully'
            })
            setTimeout(() => {
                setAlert({
                    show: false,
                    type: '',
                    message: ''
                });
            }, 3000);

            setDeletedCourseId(null);
            fetchCourses();
            fetchCourseWithQuiz();
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete course'
            });

            setTimeout(() => {
                setAlert({
                    show: false,
                    type: '',
                    message: ''
                });
            }, 3000);
        }
    };


    const handleCloseDeleteModal = () => {
        setDeletedCourseId(null);
    };


    const ViewModal = () => {
        if (!showViewModal || !selectedTopic) return null;

        const relatedCourse = courses.find((course) => course.course_id === selectedTopic.course_id);
        const relatedSubCategory = subCategory.find((c) => c.category_id === selectedTopic.category_id);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-800 to-blue-600 rounded-t-xl border-b">
                        <h3 className="text-xl font-semibold text-white tracking-tight capitalize">
                            Course Details : {selectedTopic.course_college_name}
                        </h3>
                        <button
                            onClick={() => {
                                setShowViewModal(false);
                                setSelectedTopic(null);
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                Category
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                                {relatedCourse?.course_name || 'Not Specified'}
                            </p>
                        </div>

                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                Sub Category
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                                {relatedSubCategory?.category_name || 'Not Specified'}
                            </p>
                        </div>

                        {/* Quiz Name */}
                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                Quiz Name
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                                {selectedTopic.course_college_name}
                            </p>
                        </div>

                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                Number of Questions
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium">
                                {selectedTopic.no_of_questions}
                            </p>
                        </div>

                        {/* Quiz Type */}
                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                Quiz Type
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                                {selectedTopic.questions_type}
                            </p>
                        </div>

                        <div className="group">
                            <h4 className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                                course code
                            </h4>
                            <p className="mt-2 text-lg text-gray-700 font-medium">
                                {selectedTopic.category_code}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="p-5" >
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>

                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded p-2 w-64 focus:outline-none"
                    />
                    <button
                        onClick={handleAddCourses}
                        className="text-white bg-[#050708] px-3 py-2 rounded-lg flex items-center gap-1"
                    >
                        <Plus size={20} /> Add Course
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-black text-white uppercase">


                                {[
                                    "Course Id",
                                    "Category",
                                    "Sub Catagory",
                                    "Course Title",
                                    "Number of Quizzes",
                                    "Quiz Type",
                                    "course code",
                                    "Actions",
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-3 text-center text-xs font-medium text-white captitalize"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-center">
                            {filteredCourseWithQuiz.map((course, index) => (
                                <tr key={course.cwq_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-xl capitalize">
                                        {courses.find((c) => c.course_id === course.course_id)?.course_name || 'No Category'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-xl capitalize">
                                        {

                                            subCategory.find((c) => c.category_id === course.category_id)?.category_name || "No Category"
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        {course.course_college_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        {course.no_of_questions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        {course.questions_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        {course.category_code || null}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-12 justify-center">
                                            <button
                                                onClick={() => handleView(course.cwq_id)}
                                                className="p-1 text-gray-500 hover:text-gray-600 rounded-lg"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUpdateData(course);
                                                    setOpenUpdate(true);
                                                }}
                                                className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setDeletedCourseId(course.cwq_id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {alert.show && (
                <div className={`fixed top-32 right-4 z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
                    {alert.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{alert.message}</span>
                </div>
            )}

            {deletedCourseId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-xs shadow-2xl p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-800">Are you sure you want to delete this course?</h3>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ViewModal />

            {openUpdate && updateData && (
                <AdminUpdateCourse
                    course={updateData}
                    onUpdateSuccess={() => {
                        fetchCourses();
                        fetchSubCategory();
                        fetchCourseWithQuiz();
                        setAlert({
                            show: true,
                            type: 'success',
                            message: 'Course updated successfully'
                        });

                        setTimeout(() => {
                            setAlert({
                                show: false,
                                type: '',
                                message: '',
                            });
                        }, 3000);

                        setOpenUpdate(false);
                    }}
                    onClose={() => setOpenUpdate(false)}
                />
            )}
            {showAddModal && (
                <AdminAddCourse
                    onAddSuccess={handleAddCourses}
                    onClose={handleClose}
                />
            )}
        </div>

    );
};

export default AdminCourse;
