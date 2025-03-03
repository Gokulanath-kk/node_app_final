import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2, AlertCircle, X } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import Slate from '../AdminDashboard/Slate';
import AdminAddCategory from './AdminAddCatagory';
import AdminUpdateCategory from './AdminUpdatecatagory';

const AdminCategory = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [deletedCategoryId, setDeletedCategoryId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [categoryToUpdate, setCategoryToUpdate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthToken = () => {
        return sessionStorage.getItem('token');
    };

    const fetchCourses = async () => {
        try {
            const token = getAuthToken();
            const res = await axiosInstance.get("/courses/CourseData", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCourses(res.data);
        } catch (error) {
            showAlertMessage('error', 'Failed to fetch courses');
        }
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/catagory/category');
            setCategories(response.data);
            filterCategories(response.data, courses, searchTerm);
        } catch (error) {
            showAlertMessage('error', 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    };

    const filterCategories = (categoriesData, coursesData, search) => {
        const searchLower = search.toLowerCase();
        const filtered = categoriesData.filter(category => {

            const course = coursesData.find(c => c.course_id === category.course_id);
            const categoryIdMatch = category.category_id.toString().includes(searchLower);
            const categoryNameMatch = category.category_name.toLowerCase().includes(searchLower);
            const courseNameMatch = course ? course.course_name.toLowerCase().includes(searchLower) : false;
            const subcoursesMatch = course && course.subcourses ?
                course.subcourses.some(subcourse =>
                    subcourse.name.toLowerCase().includes(searchLower)
                ) : false;
            return categoryIdMatch || categoryNameMatch || courseNameMatch || subcoursesMatch;
        });
        setFilteredCategories(filtered);
    };

    const showAlertMessage = (type, message) => {
        setAlert({
            show: true,
            type,
            message
        });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 3000);
    };

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategories(categories, courses, searchTerm);
    }, [categories, courses, searchTerm]);


    const handleView = (categoryId) => {
        const categoryToView = categories.find(c => c.category_id === categoryId);
        setSelectedCategory(categoryToView);
    };

    const handleAddCategory = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        fetchCourses()
        setShowAddModal(false);
        fetchCategories();
    };

    const handleCloseDeleteModal = () => {
        setDeletedCategoryId(null);
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.delete(`/catagory/delete/${deletedCategoryId}`);

            if (response.data.success) {
                setCategories(prevCategories =>
                    prevCategories.filter(category => category.category_id !== deletedCategoryId)
                );
                setFilteredCategories(prevFiltered =>
                    prevFiltered.filter(category => category.category_id !== deletedCategoryId)
                );

                showAlertMessage('success', 'Category deleted successfully');
                if (response.data.courseDeleted) {
                    await fetchCourses();
                }
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            showAlertMessage('error', error.message || 'Failed to delete category');
        } finally {
            setIsLoading(false);
            setDeletedCategoryId(null);
        }
    };

    const handleOpenUpdateModal = (category) => {
        setCategoryToUpdate(category);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setCategoryToUpdate(null);
        fetchCategories(); // Refresh the list after updating
    };

    const ViewModal = () => (
        selectedCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-t-xl">
                        <h3 className="text-xl font-semibold text-white tracking-tight capitalize">
                            {selectedCategory.category_name}
                        </h3>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Course</h4>
                                <p className="mt-1 text-lg text-gray-700 font-medium capitalize">
                                    {courses.find(c => c.course_id === selectedCategory.course_id)?.course_name || 'No Course Assigned'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                                <p className="mt-1 text-lg text-gray-700 font-medium capitalize">
                                    {selectedCategory.category_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    return (

        <div className="px-10 py-10 custom-scrollbar">
            <div className="mb-8 flex items-center gap-32 justify-around">
                <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded p-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleAddCategory}
                        disabled={isLoading}
                        className="text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                        <Plus size={20} /> Add Category
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">sub Category Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category, index) => {
                                    const matchingCourse = courses.find((c) => c.course_id === category.course_id);
                                    return (
                                        <tr key={category.category_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 capitalize">
                                                {matchingCourse ? matchingCourse.course_name : 'No Course'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 capitalize">
                                                {category.category_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-12 justify-center">
                                                    <button
                                                        onClick={() => handleView(category.category_id)}
                                                        className="p-1 text-gray-500 hover:text-gray-600 transition-colors duration-200"
                                                        disabled={isLoading}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenUpdateModal(category)}
                                                        className="p-1 text-amber-600 hover:text-amber-700 transition-colors duration-200"
                                                        disabled={isLoading}
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletedCategoryId(category.category_id)}
                                                        className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {alert.show && (
                <div className={`fixed top-32 right-4 z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-opacity duration-300`}>
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

            <ViewModal />

            <AdminUpdateCategory
                open={isUpdateModalOpen}
                updateData={categoryToUpdate}
                onClose={handleCloseUpdateModal}
                onUpdateSuccess={() => {
                    fetchCategories();
                    fetchCourses()
                    handleCloseUpdateModal();
                }}
            />

            {deletedCategoryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-xs shadow-2xl p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
                        <p className="mt-2 text-gray-600">Are you sure you want to delete this category?</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <AdminAddCategory
                    onAddSuccess={() => {
                        fetchCourses()

                        fetchCategories();
                        handleCloseAddModal();
                    }}
                    onClose={handleCloseAddModal}
                />
            )}
        </div>

    );
};

export default AdminCategory;