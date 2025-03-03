import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { X, Menu } from 'lucide-react';


const QuizSideBar = ({ onQuizSelect, currentQuizId }) => {
  const [quiz, setQuiz] = useState([]);
  const [course, setCourse] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
  const course_id = userData[0]?.course_id || '';
  const student_id = userData[0]?.student_id || '';

  const fetchCourse = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/courses/viewCourse/${course_id}`);
      if (res.data && res.data.length > 0) {
        setCourse(res.data[0].course_name);
      } else {
        throw new Error('Course name not found');
      }
    } catch (err) {
      console.error("Error fetching course name:", err);
    }
  }, [course_id]);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/quiz/coursequiz/${course_id}`);
      setQuiz(res.data);
      if (res.data.length > 0) {
        handleQuizSelect(res.data[0].quiz_id);
      }
    } catch (err) {
      console.error(err, 'Error');
    }
  }, [course_id]);

  useEffect(() => {
    fetchCourse();
    fetchQuiz();
  }, [fetchCourse, fetchQuiz]);

  const handleQuizSelect = (quizId) => {
    setSelectedQuiz(quizId);
    onQuizSelect(quizId);
  };

  return (
    <>
      <div
        className={`inset-0 md:hidden transition-all duration-300 
          ${isOpen ? '' : 'pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`sm:block md:hidden fixed top-32 left-2 z-50 p-2 rounded text-white bg-gray-950 
          transition-all duration-300 hover:scale-105 active:scale-95
          ${isOpen ? "translate-x-52 left-20 -ml-5" : "translate-x-0"}`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 h-auto bg-gradient-to-b from-white to-gray-50 transition-all duration-300
          ease-in-out overflow-hidden border-r border-t border-gray-100
          ${isOpen ? 'w-64' : 'w-0'} 
          sm:w-52 sm:translate-x-0 
          md:w-52 md:translate-x-0 
          lg:w-72 lg:translate-x-0 ml-10`}
      >
        <div className="h-[70vh] p-6 bg-purple-100 rounded-md shadow-md overflow-y-auto">
          <h1 className="text-lg font-bold mb-4">Questions</h1>
          <hr className="mb-4 border-t-2 border-slate-300" />
          <ul className="space-y-4">
            {quiz.map((quizItem, index) => (
                <li
                    key={quizItem.quiz_id}
                    onClick={() => handleQuizSelect(quizItem.quiz_id)}
                    className={`flex items-center p-2 cursor-pointer ${
                        selectedQuiz === quizItem.quiz_id || currentQuizId === quizItem.quiz_id
                            ? 'text-purple-700 font-semibold'
                            : 'text-purple-500'
                    }`}
                >
                    <span
                        className={`w-4 h-4 rounded-lg mr-3 ${
                             currentQuizId === quizItem.quiz_id
                                ? 'bg-purple-700'
                                : 'bg-gray-400'
                        }`}
                    ></span>
                    Question {index + 1}
                </li>
            ))}
        </ul>
        </div>
      </aside>
    </>
  );
};

export default QuizSideBar;