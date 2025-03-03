import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const AdminUpdateCategory = ({ open, updateData, onClose, onUpdateSuccess }) => {
  console.log(updateData, 'updateData');

  const [updatedCategory, setUpdatedCategory] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);


  const fetchCourseName = useCallback(async () => {

    try {
      const response = await axiosInstance.get(
        `/courses/viewCourse/${updateData.course_id}`
      );

      console.log(response, "response");

      const category = response.data[0]?.course_name;

      console.log(category, "category");


      setUpdatedCategory((prevData) => ({
        ...prevData,
        course_name: category,
      }));
    } catch (error) {
      console.error('Failed to fetch course name:', error);
    }
  }, [updateData]);


  useEffect(() => {
    if (updateData) {
      setUpdatedCategory((prevData) => ({
        ...updateData,
        course_name: updateData.course_name || '',
      }));
      fetchCourseName();
    }
  }, [updateData, fetchCourseName]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleUpdate = async () => {
  
    const dataToUpdate = {
      course_id: updateData.course_id,
      course_name: updatedCategory.course_name || updateData.course_name,
      category_name: updatedCategory.category_name,
    };
  
    try {
      setIsLoading(true);
      // Send the updated data directly
      await axiosInstance.put(
        `/catagory/updatecategory/${updatedCategory.category_id}`,
        dataToUpdate
      );
  
      showAlert('success', 'Category updated successfully');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update category';
      console.error(dataToUpdate); // Log the updated data for debugging
      showAlert('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  if (!open || !updatedCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all ease-in-out duration-300 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl border-b border-blue-700/30">
          <h3 className="text-xl font-bold text-white tracking-tight capitalize">
            Update Category
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            disabled={isLoading}
          >
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-blue-100 scrollbar-thumb-blue-500">
          <div className="p-6 space-y-6">
            <div className="group">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize tracking-wide mb-2">
                Course Name
              </h4>
              <input
                type="text"
                value={updatedCategory?.course_name || ""}
                onChange={(e) =>
                  setUpdatedCategory((prevData) => ({
                    ...prevData,
                    course_name: e.target.value, 
                  }))
                }
                className="w-full px-4 py-3 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Enter course name"
                disabled={isLoading} 
              />
            </div>
            <div className="group">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize tracking-wide mb-2">
                Sub Category
              </h4>
              <input
                type="text"
                value={updatedCategory.category_name || ''}
                onChange={(e) =>
                  setUpdatedCategory((prevData) => ({
                    ...prevData,
                    category_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 text-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
                placeholder="Enter category name"
              />
            </div>


            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className={`px-5 py-2.5 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>

        {alert.show && (
          <div
            className={`fixed top-10 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
          >
            <span>{alert.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpdateCategory;
