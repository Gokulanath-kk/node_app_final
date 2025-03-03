import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const AdminUpdateQuiz = ({ data, onClose, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState([]);
  const [category, setCategory] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [quizData, setQuizData] = useState({
    course_id: "",
    category_id: "",
    quiz_type: "",
    quiz_name: "",
    quiz_question: "",
    quiz_options: [],
    quiz_correct_answer: {},
    quiz_description: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axiosInstance.get('/courses/courseData', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCourseName(response.data);
      } catch (error) {
        setError(error.message || "Failed to fetch courses.");
        setTimeout(() => setError(""), 3000);
      }
    };

    fetchCourses();
    if (data && data.course_id) {
      fetchCategory(data.course_id);
    }

    if (data) {
      initializeQuizData(data);
    }
  }, [data]);

  const fetchCategory = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/catagory/courseCategory/${courseId}`);
      setCategory(response.data);
    } catch (err) {
      console.error("Error:", err.response?.data?.message || "Unknown error");
      setError(err.response?.data?.message || "Failed to fetch categories");
      setTimeout(() => setError(""), 3000);
    }
  };

  const initializeQuizData = (quizData) => {
    try {
      let initialOptions = [];
      if (Array.isArray(quizData.quiz_options)) {
        initialOptions = typeof quizData.quiz_options[0] === 'string'
          ? JSON.parse(quizData.quiz_options)
          : quizData.quiz_options;
      } else if (typeof quizData.quiz_options === 'string') {
        initialOptions = JSON.parse(quizData.quiz_options);
      }

      initialOptions = initialOptions.map((opt, index) => ({
        id: index,
        text: opt.text || opt,
        isCorrect: false
      }));

      let correctAnswer = {};
      try {
        const parsedCorrectAns = typeof quizData.quiz_correct_answer === 'string'
          ? JSON.parse(quizData.quiz_correct_answer)
          : quizData.quiz_correct_answer;

        if (Array.isArray(parsedCorrectAns) && parsedCorrectAns.length > 0) {
          correctAnswer = parsedCorrectAns[0];
          initialOptions = initialOptions.map(opt => ({
            ...opt,
            isCorrect: opt.id === correctAnswer.id
          }));
        }
      } catch (e) {
        console.warn("Error parsing correct answer:", e);
      }

      setQuizData({
        course_id: quizData.course_id || "",
        category_id: quizData.category_id || "",
        quiz_type: quizData.quiz_type || "",
        quiz_name: quizData.quiz_name || "",
        quiz_question: quizData.quiz_question || "",
        quiz_options: initialOptions,
        quiz_correct_answer: correctAnswer,
        quiz_description: quizData.quiz_description || "",
      });
    } catch (err) {
      console.error("Error setting quiz data:", err);
      setError("Error loading quiz data");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setQuizData(prev => ({
      ...prev,
      course_id: courseId,
      category_id: ""
    }));
    if (courseId) {
      await fetchCategory(courseId);
    } else {
      setCategory([]);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...quizData.quiz_options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      text: value.trim()
    };

    setQuizData(prev => ({
      ...prev,
      quiz_options: updatedOptions
    }));
  };

  const addOption = () => {
    setQuizData(prev => ({
      ...prev,
      quiz_options: [
        ...prev.quiz_options,
        {
          id: prev.quiz_options.length,
          text: "",
          isCorrect: false
        }
      ]
    }));
  };

  const removeOption = (index) => {
    if (quizData.quiz_options.length <= 2) {
      setError("Minimum 2 options required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setQuizData(prev => {
      const newOptions = prev.quiz_options
        .filter((_, i) => i !== index)
        .map((opt, i) => ({ ...opt, id: i }));

      const newCorrectAnswer = prev.quiz_correct_answer.id === index
        ? {}
        : {
          ...prev.quiz_correct_answer,
          id: prev.quiz_correct_answer.id > index
            ? prev.quiz_correct_answer.id - 1
            : prev.quiz_correct_answer.id
        };

      return {
        ...prev,
        quiz_options: newOptions,
        quiz_correct_answer: newCorrectAnswer
      };
    });
  };

  const handleCorrectAnswerChange = (option) => {
    setQuizData(prev => ({
      ...prev,
      quiz_correct_answer: { ...option, isCorrect: true },
      quiz_options: prev.quiz_options.map(opt => ({
        ...opt,
        isCorrect: opt.id === option.id
      }))
    }));
  };

  const validateQuizData = () => {
    if (!quizData.course_id) return "Please select a course";
    if (!quizData.category_id) return "Please select a category";
    if (!quizData.quiz_type) return "Please select quiz difficulty";
    if (!quizData.quiz_name.trim()) return "Please enter quiz name";
    if (!quizData.quiz_question.trim()) return "Please enter quiz question";
    if (quizData.quiz_options.length < 2) return "Minimum 2 options required";
    if (!quizData.quiz_correct_answer.text) return "Please select a correct answer";
    if (!quizData.quiz_description.trim()) return "Please enter quiz description";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const validationError = validateQuizData();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const submissionData = {
        ...quizData,
        quiz_options: JSON.stringify(quizData.quiz_options),
        quiz_correct_answer: JSON.stringify([quizData.quiz_correct_answer])
      };

      const response = await axiosInstance.put(
        `/quiz/updateQuiz/${data.quiz_id}`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      if (response.status !== 200) throw new Error(response.data.message || "Failed to update quiz");

      setSuccess("Quiz updated successfully");
      if (onUpdateSuccess) onUpdateSuccess();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error occurred:", err);
      setError(err.message || "Failed to update quiz");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-500/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-600 rounded-t-xl border-b">
          <h3 className="text-xl font-semibold text-white">Update Quiz</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 text-green-700">
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={quizData.course_id}
                onChange={handleCourseChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {courseName.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                value={quizData.category_id}
                onChange={(e) => setQuizData(prev => ({
                  ...prev,
                  category_id: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                disabled={loading || !quizData.course_id}
              >
                <option value="">Select Course</option>
                {category.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Difficulty
              </label>
              <select
                value={quizData.quiz_type}
                onChange={(e) => setQuizData(prev => ({
                  ...prev,
                  quiz_type: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Name
              </label>
              <input
                type="text"
                value={quizData.quiz_name}
                onChange={(e) => setQuizData(prev => ({
                  ...prev,
                  quiz_name: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                value={quizData.quiz_question}
                onChange={(e) => setQuizData(prev => ({
                  ...prev,
                  quiz_question: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz question"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              {quizData.quiz_options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:border-blue-400 transition-colors bg-gray-50"
                >
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 bg-transparent outline-none border-none [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
                    placeholder="Enter option text"
                    disabled={loading}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={quizData.quiz_correct_answer.id === option.id}
                      onChange={() => handleCorrectAnswerChange(option)}
                      className="flex-1 bg-transparent border-none outline-none"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600">Correct</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    disabled={loading || quizData.quiz_options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Description
              </label>
              <textarea
                value={quizData.quiz_description}
                onChange={(e) => setQuizData(prev => ({
                  ...prev,
                  quiz_description: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz description"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-800 to-blue-800 text-white py-2.5 px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateQuiz;