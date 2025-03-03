import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const navigate = useNavigate();
  const [quizResults] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [category_id, setCategoryId] = useState([]);

  const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
  const student_id = userData[0]?.student_id || '';
  const cwd = userData[0]?.cwq_id || '';

  const fetchCourseWithQuiz = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/newcourse/view/${cwd}`);
      const categoryId = response.data[0]?.category_id || '';
      setCategoryId(categoryId);
    } catch (err) {
      console.error('Error fetching category_id:', err);
    }
  }, [cwd]);

  const fetchProgress = useCallback(async () => {
    if (!category_id || !student_id) return;
    try {
      const res = await axiosInstance.post('/quizprogress/resultProgress', {
        category_id,
        student_id,
      });

      if (res.data) {
        const validQuizzes = res.data.filter(
          (item) => item.correct_quiz !== null || item.wrong_quiz !== null
        );
        setQuizData(validQuizzes);
      } else {
        throw new Error('Progress data not found');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [category_id, student_id]);

  useEffect(() => {
    fetchCourseWithQuiz();
    fetchProgress();
  }, [fetchProgress, fetchCourseWithQuiz]);

  const currentQuiz = quizData[currentQuizIndex];

  const options = currentQuiz?.quiz_options
    ? Array.isArray(currentQuiz.quiz_options)
      ? currentQuiz.quiz_options
      : typeof currentQuiz.quiz_options === 'string'
      ? JSON.parse(currentQuiz.quiz_options)
      : []
    : [];

  const isLastQuestion = currentQuizIndex === quizData.length - 1;

  const getOptionStyle = (option) => {
    const quizResult = quizData[currentQuizIndex];
    const correctQuizData = quizData[currentQuizIndex]?.quiz_correct_answer;

    const correctOptions = correctQuizData ? JSON.parse(correctQuizData) : [];
    const correctOptionId = correctOptions[0]?.id;

    const isCorrect = option.id === correctOptionId;
    const isWrong = option.id === quizResult?.wrong_quiz;

    if (isCorrect) {
      return 'bg-litegreen text-white';
    }
    if (isWrong) {
      return 'bg-red-600 text-white';
    }
    return 'bg-purple-200 text-gray-950';
  };

  const handleNext = useCallback(() => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else if (isLastQuestion) {
      navigate(-1);
    }
  }, [currentQuizIndex, isLastQuestion, quizData.length, navigate]);

  const handlePrevious = useCallback(() => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prev) => prev - 1);
    }
  }, [currentQuizIndex]);

  const showExplanation = currentQuiz?.quiz_description && 
  quizResults.length === 0 && 
  !['na', 'n/a'].includes(currentQuiz?.quiz_description?.toLowerCase()?.trim());


  return (
    <div className="px-4 md:px-8 lg:px-20 py-5 h-full">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-screen-md mx-auto bg-slate-50">
        <div className="flex items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-start flex-1 text-slate-600">
            Your results:
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-litegreen rounded-sm mr-2"></div>
              <span className="text-black text-sm">Correct answers</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-black text-sm">Incorrect answers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
          {quizData.map((quiz, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center text-center cursor-pointer"
              onClick={() => setCurrentQuizIndex(index)}
            >
              <div
                className={`w-10 h-10 rounded-sm ${
                  quiz.correct_quiz !== null ? 'bg-litegreen' : 'bg-red-500'
                } flex items-center justify-center`}
              >
                <span className="text-white text-sm">{index + 1}</span>
              </div>
              {index === currentQuizIndex && (
                <div className="absolute -top-2 left-20 inline-flex items-center justify-center ">
                  <div className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75 animate-ping"></div>
                  <div className="relative w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-white-5"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Question Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-screen-md mx-auto mt-5">
        <div className="font-sans bg-white rounded-md shadow-sm">
          <div className="border-b p-4 rounded-t">
            <div className="flex justify-start items-start">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Question {currentQuizIndex + 1}
              </h2>
            </div>
          </div>
          <div className="font-sans p-6">
            <h3 className="text-md md:text-lg font-medium text-gray-900 mb-6">
              {currentQuiz?.quiz_question}
            </h3>
            <div className="space-y-3">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-4 p-3 rounded-md border cursor-pointer ${getOptionStyle(
                      option
                    )}`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getOptionStyle(
                        option
                      )}`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <p>{option.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-red-500">No options available for this quiz</div>
              )}
            </div>

          </div>
          {showExplanation && (
            <div className="mt-6 p-4 border-t">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Explanation</h1>
              <h3 className="text-md text-gray-700">{currentQuiz?.quiz_description}</h3>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={handlePrevious}
            disabled={currentQuizIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              currentQuizIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-transparent text-purple-600 hover:bg-purple-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isLastQuestion ? 'bg-litegreen text-white' : 'bg-transparent text-purple-600 hover:bg-purple-100'
            }`}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
