import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArchiveRestoreIcon, Trash, Trash2 } from 'lucide-react';
import axiosInstance from "../../axiosInstance";

const AdminTrash = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState([]);
  const [bulkRestoreModal, setBulkRestoreModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [restoreQuizId, setRestoreQuizId] = useState(null);
  const [subcategory, setSubCategory] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const getAuthToken = () => sessionStorage.getItem('token');

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axiosInstance.get("/courses/CourseData", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("Failed to fetch categories", "error");
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    if (selectedCategory === "all") {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }
    try {
      const response = await axiosInstance.get(`/catagory/viewsubcatagory/${selectedCategory}`);
      setSubcategories(response.data);
      setSelectedSubcategory('');
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      showAlert("Failed to fetch subcategories", "error");
    }
  }, [selectedCategory]);

  const fetchSubCategory = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/catagory/category");
      setSubCategory(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/trash/trashedquiz');
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      showAlert("Failed to fetch quizzes", "error");
    }
  }, []);

  const formatQuizOptions = (options) => {
    try {
      if (typeof options === 'string' && options.trim()) {
        return JSON.parse(options).map(opt => opt.text).join(', ');
      }
      if (Array.isArray(options)) {
        return options.map(opt => opt.text).join(', ');
      }
      return '';
    } catch (error) {
      console.error('Error formatting quiz options:', error);
      return '';
    }
  };

  const formatCorrectAnswers = (answers) => {
    try {
      if (typeof answers === 'string' && answers.trim()) {
        const parsedAnswers = JSON.parse(answers);
        return Array.isArray(parsedAnswers)
          ? parsedAnswers.map(ans => ans.text).join(', ')
          : parsedAnswers.text;
      }
      return '';
    } catch (error) {
      console.error('Error formatting correct answers:', error);
      return '';
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (selectedCategory === "all") return true;
    if (!selectedSubcategory) return quiz.course_id === parseInt(selectedCategory);
    return quiz.course_id === parseInt(selectedCategory) && quiz.category_id === parseInt(selectedSubcategory);
  });

  const handleAllQuizSelect = (e) => {
    setSelectedQuiz(e.target.checked ? filteredQuizzes.map(quiz => quiz.quiz_id) : []);
  };

  const handleQuizSelect = (quizId) => {
    setSelectedQuiz(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  const handleBulkRestore = async () => {
    try {
      const response = await axiosInstance.delete('/trash/restoreAllQuiz', {
        data: { quizIds: selectedQuiz }
      });
      setQuizzes(prev => prev.filter(quiz => !selectedQuiz.includes(quiz.quiz_id)));
      setSelectedQuiz([]);
      setBulkRestoreModal(false);
      showAlert(response.data.message || `Successfully restored ${selectedQuiz.length} quizzes`);
    } catch (error) {
      console.error("Error restoring quizzes:", error);
      showAlert(error.response?.data?.message || "Failed to restore selected quizzes", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axiosInstance.delete('/quiz/deleteQuizes', {
        data: { quizIds: selectedQuiz }
      });
      setQuizzes(prev => prev.filter(quiz => !selectedQuiz.includes(quiz.quiz_id)));
      setSelectedQuiz([]);
      setShowBulkDeleteModal(false);
      showAlert(response.data.message || `Successfully deleted ${selectedQuiz.length} quizzes`);
    } catch (error) {
      console.error("Error deleting quizzes:", error);
      showAlert(error.response?.data?.message || "Failed to delete selected quizzes", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/quiz/deleteQuiz/${deleteQuizId}`);
      setQuizzes(prev => prev.filter(quiz => quiz.quiz_id !== deleteQuizId));
      setDeleteQuizId(null);
      showAlert("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      showAlert("Failed to delete quiz", "error");
    }
  };

  const handleRestore = async () => {
    try {
      await axiosInstance.delete(`/trash/undoTrash/${restoreQuizId}`);
      setQuizzes(prev => prev.filter(quiz => quiz.quiz_id !== restoreQuizId));
      setRestoreQuizId(null);
      showAlert("Quiz restored successfully");
    } catch (error) {
      console.error("Error restoring quiz:", error);
      showAlert("Failed to restore quiz", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchQuizzes();
  }, [fetchCategories, fetchQuizzes]);

  useEffect(() => {
    fetchSubCategory();
    fetchSubcategories();
  }, [fetchSubcategories, selectedCategory]);

  const indexOfLastQuiz = currentPage * itemsPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - itemsPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory]);

  const Modal = ({ isOpen, onClose, title, message, confirmText, onConfirm, confirmColor = "blue" }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className={`w-6 h-6 text-${confirmColor}-600`} />
              <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 bg-${confirmColor}-600 text-white rounded-lg hover:bg-${confirmColor}-700`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Trash Management</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              {categories.map((category) => (
                <option key={category.course_id} value={category.course_id}>
                  {category.course_name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Subcategory
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={selectedCategory === "all"}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.category_id} value={subcategory.category_id}>
                  {subcategory.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {selectedQuiz.length > 0 && (
          <>
            <button
              onClick={() => setBulkRestoreModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArchiveRestoreIcon size={20} />
              <span>Restore Selected ({selectedQuiz.length})</span>
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash size={20} />
              <span>Delete Selected ({selectedQuiz.length})</span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>
            Showing {indexOfFirstQuiz + 1} to{' '}
            {Math.min(indexOfLastQuiz, filteredQuizzes.length)} of{' '}
            {filteredQuizzes.length} items
          </span>

          <select
            value={itemsPerPage === filteredQuizzes.length ? 'all' : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              setItemsPerPage(value === 'all' ? filteredQuizzes.length : Number(value));
              setCurrentPage(1);
            }}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {['10', '25', '50', 'all'].map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All' : `${value} per page`}
              </option>
            ))}
          </select>
        </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4 text-sm font-medium text-center uppercase">
                  <div className="flex flex-col items-center">
                    <label className="mb-1">Select All</label>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 transition duration-200 cursor-pointer"
                      checked={selectedQuiz.length === filteredQuizzes.length && filteredQuizzes.length > 0}
                      onChange={handleAllQuizSelect}
                    />
                  </div>
                </th>
                {["No", "Category", "Subcategory", "Section", "Question", "Options", "Answer", "Explanation", "Type", "Actions"].map((header) => (
                  <th key={header} className="p-4 text-sm font-medium text-center uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentQuizzes.map((quiz, index) => (
                <tr key={quiz.quiz_id} className="hover:bg-gray-50">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedQuiz.includes(quiz.quiz_id)}
                      onChange={() => handleQuizSelect(quiz.quiz_id)}
                      className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 transition duration-200 cursor-pointer"
                    />
                  </td>
                  <td className="p-4">{indexOfFirstQuiz + index + 1}</td>
                  <td className="p-4 max-w-xs">
                    <div className="truncate">
                      {categories.find(c => c.course_id === quiz.course_id)?.course_name}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="truncate">
                      {subcategory.find(s => s.category_id === quiz.category_id)?.category_name}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs"><div className="truncate">{quiz.Quiz_name}</div></td>
                  <td className="p-4 max-w-xs"><div className="truncate">{quiz.Quiz_Question}</div></td>
                  <td className="p-4 max-w-xs"><div className="truncate">{formatQuizOptions(quiz.quiz_option)}</div></td>
                  <td className="p-4 max-w-xs"><div className="truncate">{formatCorrectAnswers(quiz.Quiz_Correct_ans)}</div></td>
                  <td className="p-4 max-w-xs"><div className="truncate">{quiz.quiz_description}</div></td>
                  <td className="p-4"><div className="truncate">{quiz.quiz_type}</div></td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => setRestoreQuizId(quiz.quiz_id)}
                      >
                        <ArchiveRestoreIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
                        onClick={() => setDeleteQuizId(quiz.quiz_id)}
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

      <div className="flex-1 items-between justify-around gap-4 mt-6">
          {itemsPerPage !== 'all' && filteredQuizzes.length > itemsPerPage && (
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-3 bg-black text-white rounded disabled:cursor-not-allowed disabled:opacity-80"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(filteredQuizzes.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(prev =>
                    Math.min(prev + 1, Math.ceil(filteredQuizzes.length / itemsPerPage))
                  )
                }
                disabled={currentPage === Math.ceil(filteredQuizzes.length / itemsPerPage)}
                className="px-5 py-3 bg-black text-white rounded disabled:cursor-not-allowed disabled:opacity-80 "
              >
                Next
              </button>
            </div>
          )}
        </div>

      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 ${
          alert.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-opacity`}>
          {alert.type === "success" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <Modal
        isOpen={bulkRestoreModal}
        onClose={() => setBulkRestoreModal(false)}
        title="Confirm Multiple Restore"
        message={`Are you sure you want to restore ${selectedQuiz.length} selected ${
          selectedQuiz.length === 1 ? 'quiz' : 'quizzes'
        }?`}
        confirmText={`Restore ${selectedQuiz.length} ${selectedQuiz.length === 1 ? 'Quiz' : 'Quizzes'}`}
        onConfirm={handleBulkRestore}
        confirmColor="blue"
      />

      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Confirm Multiple Deletion"
        message={`Are you sure you want to delete ${selectedQuiz.length} selected ${
          selectedQuiz.length === 1 ? 'quiz' : 'quizzes'
        }? This action cannot be undone.`}
        confirmText={`Delete ${selectedQuiz.length} ${selectedQuiz.length === 1 ? 'Quiz' : 'Quizzes'}`}
        onConfirm={handleBulkDelete}
        confirmColor="red"
      />

      <Modal
        isOpen={!!deleteQuizId}
        onClose={() => setDeleteQuizId(null)}
        title="Confirm Delete"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmText="Delete Quiz"
        onConfirm={handleDelete}
        confirmColor="red"
      />

      <Modal
        isOpen={!!restoreQuizId}
        onClose={() => setRestoreQuizId(null)}
        title="Confirm Restore"
        message="Are you sure you want to restore this quiz?"
        confirmText="Restore Quiz"
        onConfirm={handleRestore}
        confirmColor="blue"
      />
    </div>
  );
};

export default AdminTrash;

