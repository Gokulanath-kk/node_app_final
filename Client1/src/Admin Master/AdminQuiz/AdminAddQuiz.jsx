import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const AdminAddQuiz = ({ onAddSuccess, onClose }) => {
  const initialQuizState = {
    course_id: '',
    category_id: '',
    quiz_name: '',
    quiz_type: 'easy',
    questions: [
      {
        id: 0,
        question_text: '',
        description: '',
        options: [
          {
            id: 0,
            text: '',
            isCorrect: false
          }
        ]
      }
    ]
  };


  const [courseName, setCourseName] = useState([]);
  const [subCatagoryName, setSubCatagoryName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [quizData, setQuizData] = useState(initialQuizState);




  const fetchcategoryid = useCallback(async (selectedCourseId) => {
    if (!selectedCourseId) return;
    try {
      const res = await axiosInstance.get(`/catagory/viewsubcatagory/${selectedCourseId}`);
      setSubCatagoryName(res.data);
    } catch (err) {
      console.error("Error fetching subcategories for course:", err);
      setError("Failed to load subcategories for the selected course.");
    }
  }, []);



  const getAuthToken = () => {
    return sessionStorage.getItem('token');
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const res = await axiosInstance.get("/courses/courseData", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourseName(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError("An error occurred while fetching course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (quizData.course_id) {
      fetchcategoryid(quizData.course_id);
    }
  }, [quizData.course_id, fetchcategoryid]);



  const handleInputChange = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'course_id' && { category_id: '' })
    }));
  };


  const handleQuestionChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        {
          ...prev.questions[0],
          [field]: value
        }
      ]
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        {
          ...prev.questions[0],
          options: prev.questions[0].options.map((option, i) =>
            i === index ? { ...option, [field]: value, id: i } : option
          )
        }
      ]
    }));
  };

  const handleAddOption = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        {
          ...prev.questions[0],
          options: [
            ...prev.questions[0].options,
            {
              id: prev.questions[0].options.length,
              text: '',
              isCorrect: false
            }
          ]
        }
      ]
    }));
  };

  const handleRemoveOption = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        {
          ...prev.questions[0],
          options: prev.questions[0].options
            .filter((_, i) => i !== index)
            .map((option, i) => ({ ...option, id: i }))
        }
      ]
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!quizData.course_id) errors.push('Please select a course');
    if (!quizData.category_id) errors.push('Please select a subcatagory');
    if (!quizData.quiz_name.trim()) errors.push('Quiz name is required');
    if (!quizData.questions[0].question_text.trim()) errors.push('Quiz question is required');
    if (!quizData.questions[0].description.trim()) errors.push('Quiz description is required');
    if (quizData.questions[0].options.length < 2) errors.push('Please add at least two options');
    if (!quizData.questions[0].options.some(option => option.isCorrect)) errors.push('Please mark at least one option as correct');
    if (quizData.questions[0].options.some(option => !option.text.trim())) errors.push('All options must have text');

    if (errors.length > 0) {
      setFormError(errors.join(' '));
      return false;
    }

    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const quizOptions = JSON.stringify(quizData.questions[0].options.map((option, index) => ({
      id: index,
      text: option.text
    })));
    const correctOptions = JSON.stringify(
      quizData.questions[0].options
        .map((option, index) => ({
          id: index,
          text: option.text,
          isCorrect: option.isCorrect
        }))
        .filter(option => option.isCorrect)
    );
    const formattedData = {
      course_id: quizData.course_id,
      category_id: quizData.category_id,
      quiz_name: quizData.quiz_name,
      quiz_question: quizData.questions[0].question_text,
      quiz_description: quizData.questions[0].description,
      quiz_options: quizOptions,
      quiz_correct_answer: correctOptions,
      quiz_type: quizData.quiz_type
    };


    try {
      const response = await axiosInstance.post('/quiz/addQuiz', formattedData);
      setSuccess('Quiz added successfully!');
      if (onAddSuccess) onAddSuccess();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error || formError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 flex items-center gap-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error || formError}</p>
        </div>
      );
    }

    if (success) {
      return (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-500/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all animate-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-800 to-blue-800 rounded-t-xl border-b">
          <h2 className="text-2xl font-bold text-white">Add New Quiz</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderMessage()}

        <div className="overflow-y-auto no-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">category</label>
                <select
                  value={quizData.course_id}
                  onChange={(e) => handleInputChange('course_id', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {courseName.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                <select
                  value={quizData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!quizData.course_id}
                >
                  <option value="">Select Subcategory</option>
                  {subCatagoryName.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Name</label>
                <input
                  type="text"
                  value={quizData.quiz_name}
                  onChange={(e) => handleInputChange('quiz_name', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={quizData.questions[0].question_text}
                  onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz question"
                />
              </div>



              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="space-y-3">
                  {quizData.questions[0].options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors bg-gray-50 group"
                    >
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="flex-1 bg-transparent border-0 focus:ring-0 p-0"
                        placeholder="Enter option text"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Correct</span>
                      </label>
                      {quizData.questions[0].options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Option
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer Description</label>
              <textarea
                value={quizData.questions[0].description}
                onChange={(e) => handleQuestionChange('description', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
                placeholder="Enter explanation for the correct answer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Difficulty</label>
              <select
                value={quizData.quiz_type}
                onChange={(e) => handleInputChange('quiz_type', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >

                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex-none flex items-center justify-end gap-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex px-4 py-2.5 border hover:bg-gray-950 hover:text-white border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex bg-gradient-to-r from-blue-800 to-blue-800 text-white py-2.5 px-4 rounded-lg hover:opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Quiz...
                  </span>
                ) : (
                  'Add Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddQuiz;