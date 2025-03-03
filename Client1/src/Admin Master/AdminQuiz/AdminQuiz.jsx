import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Upload,
  Trash,
} from "lucide-react"
import axiosInstance from "../../axiosInstance";
import AdminUpdateQuiz from "./AdminUpdateQuiz";
import AdminAddQuiz from "./AdminAddQuiz";
import Slate from "../AdminDashboard/Slate";
import ExcelUploadModal from "./ExcelUploadModal";
import { button } from "framer-motion/client";

const AdminQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [category, setSubCatagory] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [deletedQuizId, setDeletedQuizId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleExcelUploadSuccess = () => {

    fetchQuizzes();
    showAlert(` Quizzes uploaded successfully`);
  };

  const formatQuizOptions = (options) => {
    try {
      if (typeof options === 'string') {
        return JSON.parse(options).map(opt => opt.text).join(', ');
      } else if (Array.isArray(options)) {
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
        const answerArray = JSON.parse(answers);
        return Array.isArray(answerArray)
          ? answerArray.map(ans => ans.text).join(', ')
          : answerArray.text;
      }
      return '';
    } catch (error) {
      console.error('Error formatting correct answers:', error);
      return '';
    }
  };



  const getAuthToken = () => {
    return sessionStorage.getItem('token');
  };

  const fetchCourses = async () => {
    try {
      const token = getAuthToken();

      const res = await axiosInstance.get("/courses/CourseData", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      
    }
  };


  const fetchSubCatagory = useCallback(async () => {
    axiosInstance.get("/catagory/category").then((res) => {
      setSubCatagory(res.data)
    }).catch((err) => {
    })
  }, [])



  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axiosInstance.get("/quiz/QuizData");
      setQuizzes(response.data);
      
    } catch (error) {
      showAlert("Failed to fetch quizzes", "error");
    }
  };

  useEffect(() => {
    fetchSubCatagory()
    fetchQuizzes();
    fetchCourses();
  }, []);

  const handleView = async (quizId) => {
    try {
      const response = await axiosInstance.get(`/quiz/ViewQuiz/${quizId}`);
      if (response.data && response.data.length > 0) {
        setSelectedTopic(response.data[0]);
        setShowViewModal(true);
      } else {
        showAlert("Quiz details not found", "error");
      }
    } catch (error) {
      showAlert("Failed to fetch quiz details", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletedQuizId) return;

    try {
      await axiosInstance.delete(`/trash/trashdeletequiz/${deletedQuizId}`);
      setQuizzes((prev) =>
        prev.filter((quiz) => quiz.quiz_id !== deletedQuizId)
      );
      showAlert("Quiz deleted successfully");
      setDeletedQuizId(null);
    } catch (error) {
      showAlert("Failed to delete quiz", "error");
    }
  };

  const handleUpdate = () => {
    fetchQuizzes();
    setShowUpdateModal(false);
    showAlert("Quiz updated successfully");
  };

  const handleAddSuccess = () => {
    fetchQuizzes();
    setShowAddModal(false);
    showAlert("Quiz added successfully");
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.quiz_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.quiz_question?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCourse =
      selectedCourse === "all" || quiz.course_id === parseInt(selectedCourse);
  
    const matchesSubcategory =
      selectedSubcategory === "all" || quiz.category_id === parseInt(selectedSubcategory);
  
    return matchesSearch && matchesCourse && matchesSubcategory;
  });


  const fetchSubcategoriesForCourse = useCallback(async (courseId) => {
    if (courseId === "all") {
      setSubcategories([]);
      setSelectedSubcategory("all");
      return;
    }

    try {
      const response = await axiosInstance.get(`/catagory/viewsubcatagory/${courseId}`);
      setSubcategories(response.data);
      setSelectedSubcategory("all");
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    fetchSubCatagory();
    fetchQuizzes();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSubcategoriesForCourse(selectedCourse);
  }, [selectedCourse, fetchSubcategoriesForCourse]);

  const indexOfLastQuiz = currentPage * itemsPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - itemsPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedSubcategory]);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const value = e.target.value;
    setItemsPerPage(value === 'all' ? filteredQuizzes.length : Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const allQuizIds = currentQuizzes.map(quiz => quiz.quiz_id);
      setSelectedQuizzes(allQuizIds);
    } else {
      setSelectedQuizzes([]);
    }
  };

  const handleQuizSelect = (quizId) => {
    setSelectedQuizzes(prev => {
      const newSelection = prev.includes(quizId)
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId];
      return newSelection;
    });

  };



  useEffect(() => {
    if (currentQuizzes.length > 0) {
      setSelectAll(selectedQuizzes.length === currentQuizzes.length);
    }
  }, [selectedQuizzes, currentQuizzes]);


  const handleSelectedQuizDelete = async () => {
    if (selectedQuizzes.length === 0) {
      showAlert("No quizzes selected", "error");
      return;
    }
    setShowBulkDeleteModal(true);
  };


  const handleConfirmBulkDelete = async () => {
    try {
      const response = await axiosInstance.delete('/trash/softdeletedallquiz', {
        data: { quizIds: selectedQuizzes }
      });
      setQuizzes(prev => prev.filter(quiz => !selectedQuizzes.includes(quiz.quiz_id)));
      setSelectedQuizzes([]);
      setSelectAll(false);

      setShowBulkDeleteModal(false);
      showAlert(response.data.message || `Successfully deleted ${selectedQuizzes.length} quizzes`);
    } catch (error) {
      console.error("Error deleting quizzes:", error);
      showAlert(error.response?.data?.message || "Failed to delete selected quizzes", "error");
    }
  };

  const BulkDeleteModal = () => (
    showBulkDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-2 text-orange-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold mt-2">Confirm Multiple Trash</h3>
            </div>
            <p className="text-gray-600">
              Are you sure you want to trash {selectedQuizzes.length} selected {selectedQuizzes.length === 1 ? 'quiz' : 'quizzes'}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Trash {selectedQuizzes.length} {selectedQuizzes.length === 1 ? 'Quiz' : 'Quizzes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const ViewModal = () =>
    showViewModal &&
    selectedTopic && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-800 to-blue-800 rounded-t-xl border-b">
            <h3 className="text-xl font-semibold text-white tracking-tight capitalize">
              {selectedTopic.quiz_name}
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
  
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Category
                </h4>
                <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                  {courses.find((course) => course.course_id === selectedTopic.course_id)?.course_name}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  sub Category
                </h4>
                <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                  {category.find((c) => c.category_id === selectedTopic.category_id)?.category_name || "no category"}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Quiz Type
                </h4>
                <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                  {selectedTopic.quiz_type}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Quiz Name
                </h4>
                <p className="mt-2 text-lg text-gray-700 font-medium capitalize">
                  {selectedTopic.quiz_name}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Quiz Content
                </h4>
                <p className="mt-2 text-gray-700 leading-relaxed text-justify capitalize">
                  {selectedTopic.quiz_question}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Quiz Options
                </h4>
                <div className="mt-2 space-y-2">
                  {selectedTopic.quiz_options &&
                    (Array.isArray(selectedTopic.quiz_options)
                      ? selectedTopic.quiz_options
                      : JSON.parse(selectedTopic.quiz_options)
                    ).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{option.text}</p>
                      </div>
                    ))}
                </div>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Correct Answer
                </h4>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {formatCorrectAnswers(selectedTopic.quiz_correct_answer)}
                </p>
              </div>
  
              <div className="group">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Answer Description
                </h4>
                <p className="mt-2 text-gray-700 leading-relaxed text-justify">
                  {selectedTopic.quiz_description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const DeleteModal = () =>
    deletedQuizId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold mt-2">Confirm Trash</h3>
            </div>
            <p className="text-gray-600">
              Are you sure you want to Trash this quiz? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletedQuizId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <>

      <div className="p-4" >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quiz Management
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <div className="w-48">
                <label
                  htmlFor="courseFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Course
                </label>
                <select
                  id="courseFilter"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <label
                  htmlFor="subcategoryFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Subcategory
                </label>
                <select
                  id="subcategoryFilter"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedCourse === "all"}
                >
                  <option value="all">All Subcategories</option>
                  {subcategories.map((subcat) => (
                    <option key={subcat.category_id} value={subcat.category_id}>
                      {subcat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="flex items-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-white bg-[#050708] px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors h-10"
              >
                <Plus size={20} /> Add Quiz
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          {selectedQuizzes.length > 0 && (
            <button
              onClick={handleSelectedQuizDelete}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Trash size={24} />
              <span>Trash Selected ({selectedQuizzes.length})</span>
            </button>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {indexOfFirstQuiz + 1} to{' '}
              {Math.min(indexOfLastQuiz, filteredQuizzes.length)} of{' '}
              {filteredQuizzes.length}{' '}
              {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
            </span>

            <div className="flex items-center gap-1">

              <select
                value={itemsPerPage === filteredQuizzes.length ? 'all' : itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-5 py-1 pr-10 focus:outline-none focus:border-purple-600 focus:ring-purple-500 text-gray-700"
              >
                {['10', '25', '50', 'all'].map((value, index) => (
                  <option
                    key={index}
                    value={value}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-900"
                  >
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowExcelUploadModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mb-3 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" /> Upload Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="rounded">
                <tr className="bg-black text-white uppercase rounded-t">
                  <th className="px-2 py-3 text-center text-xs text-white">
                    <label htmlFor="selectAll" className=" ">
                      Select All
                    </label><br />
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 transition duration-200 cursor-pointer"
                    />
                  </th>
                  {[

                    "Quiz Serial No",
                    "Category",
                    "SubCatagory",
                    "Section Name",
                    "Quiz Question",
                    "Quiz Options",
                    "Correct Answer",
                    "quiz explanation",
                    "Quiz Type",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-center text-xs font-medium text-white captitalize"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-center">
                {currentQuizzes.map((quiz, index) => (
                  <tr key={quiz.quiz_id} className=" hover:bg-gray-50 p-3">
                    <td className="whitespace-nowrap text-sm text-gray-900 ">
                      <input
                        type="checkbox"
                        checked={selectedQuizzes.includes(quiz.quiz_id)}
                        onChange={() => handleQuizSelect(quiz.quiz_id)}
                        className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 transition duration-200 cursor-pointer"
                      />
                    </td>
                    <td className="whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstQuiz + index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm  font-xl capitalize">
                      {courses.find((c) => c.course_id === quiz.course_id)?.course_name}
                    </td>

                    <td className="px-2 py-2 text-sm capitalize  max-w-md capitalize">
                      {category.find((c) => c.category_id === quiz.category_id)?.category_name || "no category"}
                    </td>

                    <td className="px-2 py-2 text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{quiz.quiz_name}</div>
                    </td>
                    <td className="px-2 py-2 text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{quiz.quiz_question}</div>
                    </td>
                    <td className="px-2 py-2 text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{formatQuizOptions(quiz.quiz_options)}</div>
                    </td>

                    <td className="px-2 py-2 text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{formatCorrectAnswers(quiz.quiz_correct_answer)}</div>
                    </td>


                    <td className="px-2 py-2 text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{quiz.quiz_description}</div>
                    </td>

                    <td className="px-2 py-2text-sm capitalize text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{quiz.quiz_type}</div>
                    </td>
                    <td className="whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => handleView(quiz.quiz_id)}
                          className=" text-gray-500 hover:text-gray-600 rounded-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setUpdateData(quiz);
                            setShowUpdateModal(true);
                          }}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletedQuizId(quiz.quiz_id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg pe-5"
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
          <div
            className={`fixed top-32 right-4 z-50 ${alert.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}
          >
            {alert.type === "success" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{alert.message}</span>
          </div>
        )}
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


        <ViewModal />
        <DeleteModal />
        <BulkDeleteModal />

        {showUpdateModal && (
          <AdminUpdateQuiz
            data={updateData}
            onUpdateSuccess={handleUpdate}
            onClose={() => setShowUpdateModal(false)}
          />
        )}

        {showAddModal && (
          <AdminAddQuiz
            onAddSuccess={handleAddSuccess}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {showExcelUploadModal && (
          <ExcelUploadModal
            onClose={() => setShowExcelUploadModal(false)}
            onUploadSuccess={handleExcelUploadSuccess}
          />
        )}
      </div >
    </>
  );
};

export default AdminQuiz;