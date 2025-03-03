import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const AdminAddCategory = ({ onAddSuccess, onClose }) => {
    const [courseName, setCourseName] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
   
        if (!courseName) {
            setError('Please select a course');
            return;
        }
        if (!newCategory) {
            setError('Please select a category');
            return;
        }
   
        console.log(courseName, newCategory, "data");
   
        try {
            await axiosInstance.post('/courses/addCourse', {
                course_name: courseName,
                course_categories: [newCategory]
            });
   
            onAddSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add course');
        }
    };
   

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all ease-in-out duration-300 flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl border-b border-blue-700/30">
                    <h3 className="text-xl font-bold text-white tracking-tight">Add New Category</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                        <X className="w-6 h-6 text-white" strokeWidth={2} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="group">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize tracking-wide mb-2">
                            catagory Name
                        </h4>
                        <div className="flex space-x-2 mb-4">
                            <input
                                value={courseName}
                                placeholder='Enter Category'
                                onChange={(e) => setCourseName(e.target.value)}
                                className="flex-grow px-4 py-2 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            />
                            
                        </div>
                    </div>

                    <div className="group">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize tracking-wide mb-2">
                            Sub Category Name
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter Sub Category"
                                className="flex-grow px-4 py-2 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                            />
                               
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 dark:focus:ring-blue-400"
                            
                        >
                            <Plus size={20} />
                            Add category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAddCategory;