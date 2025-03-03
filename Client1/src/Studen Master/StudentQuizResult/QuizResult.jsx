import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { ChevronLeft, ChevronRight, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizResult = () => {

    const navigate = useNavigate()

    const [course, setCourse] = useState([]);
    const [quizResults, setQuizResults] = useState([]);
    const [quizData, setQuizData] = useState([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const course_id = userData[0]?.course_id || '';
    const student_id = userData[0]?.student_id || '';

    const fetchCourse = useCallback(async () => {
        if (!course_id) return;
        axiosInstance.get(`/courses/viewCourse/${course_id}`).then((res) => {
            setCourse(res.data.course_name)
        }).catch((err) => {
            console.error(err , "Error"); 
        })
    }, [course_id]);

    const fetchProgress = useCallback(async () => {
        if (!course_id || !student_id) return;
        try {
            const res = await axiosInstance.post('/quizprogress/resultProgress', {
                course_id,
                student_id,
            });

            if (res.data) {
                const validQuizzes = res.data.filter(
                    (item) => item.correct_quiz !== null || item.wrong_quiz !== null
                );
                setQuizResults(validQuizzes);
            } else {
                throw new Error('Progress data not found');
            }
        } catch (err) {
            console.error("Error fetching progress:", err);
        }
    }, [course_id, student_id]);

    const fetchQuizzes = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/quiz/coursequiz/${course_id}`);
            setQuizData(res.data)
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        }
    }, [course_id]);

    useEffect(() => {
        fetchCourse();
        fetchProgress();
        fetchQuizzes();
    }, [fetchCourse, fetchProgress, fetchQuizzes]);

    useEffect(() => {

    }, [currentQuizIndex, quizData]);

    const currentQuiz = quizData[currentQuizIndex];

    const options = currentQuiz?.quiz_option
        ? (Array.isArray(currentQuiz.quiz_option)
            ? currentQuiz.quiz_option
            : (typeof currentQuiz.quiz_option === 'string'
                ? JSON.parse(currentQuiz.quiz_option)
                : []))
        : [];

    const isLastQuestion = currentQuizIndex === quizData.length - 1;

    const getOptionStyle = (option) => {
        const quizResult = quizResults[currentQuizIndex];
        const correctQuizData = quizData[currentQuizIndex]?.Quiz_Correct_ans;

        const correctOptions = correctQuizData
            ? JSON.parse(correctQuizData)
            : [];
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
            setTimeLeft(60);
        } else if (isLastQuestion) {
            navigate(-1)
        }
    }, [currentQuizIndex, isLastQuestion, quizData.length]);

    const handlePrevious = useCallback(() => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex((prev) => prev - 1);
            setTimeLeft(60);
        }
    }, [currentQuizIndex]);

    return (
        <div className="px-20 py-5 h-full">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-screen mx-auto bg-slate-50 ">
                <div className="flex items-center mb-4 ">
                    <h2 className="text-xl font-semibold text-start flex-1 text-slate-600">Your results :</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-5 h-5 bg-litegreen rounded-sm mr-2"></div>
                            <span className="text-black">Correct answers</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-5 h-5 bg-red-500 rounded-sm mr-2"></div>
                            <span className="text-black">Incorrect answers</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-4 mt-10">
                    {quizResults.map((quiz, index) => (
                        <div
                            key={index}
                            className="relative flex items-center justify-center text-center cursor-pointer"
                            onClick={() => setCurrentQuizIndex(index)}
                        >
                            <div
                                className={`w-10 h-10  rounded-sm ${quiz.correct_quiz !== null ? 'bg-litegreen' : 'bg-red-500'
                                    } flex items-center justify-center`}
                            >
                                <span className="text-white text-sm">{index + 1}</span>
                            </div>
                            {index === currentQuizIndex && (
                                <div className="absolute -top-2 left-20 inline-flex items-center justify-center ml-10">
                                    
                                    <div className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
            opacity-75 animate-ping"></div>
                                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-white-5"></div>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 max-w-screen mx-auto mt-5">
                <div className="bg-white rounded-md shadow-sm">
                    <div className="border-b p-4 rounded-t">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Question {currentQuizIndex + 1}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600">Points:</span>
                                <span className="flex items-center gap-1">
                                    <span className="w-5 h-5 text-yellow-400" />
                                    <span className="text-lg font-semibold">1</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 ">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuiz?.Quiz_Question}</h3>
                        <div className="space-y-3 px-20">
                            {options.length > 0 ? (
                                options.map((option, index) => {
                                    const optionLabel = String.fromCharCode(65 + index);
                                    return (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-4 p-3 rounded-md border cursor-pointer 
                                                ${getOptionStyle(option)}`}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                                                    ${getOptionStyle(option)}`}
                                            >
                                                <span className="font-medium text-inherit">{optionLabel}</span>
                                            </div>
                                            <p>{option.text}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-red-500">No options available for this quiz</div>
                            )}
                        </div>
                        <div className='py-8'>
                            <h1 className='text-lg font-medium text-gray-900 mb-6'>Explanation :</h1>
                            <p className='text-md text-slate-600 font-medium'>{currentQuiz?.quiz_description}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-5">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuizIndex === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border border-purple-300 transition-all 
                            ${currentQuizIndex === 0
                                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                : 'bg-transparent text-purple-600 border-purple-300 hover:bg-purple-100'}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={false}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                            ${false
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-lite text-white '}`}
                    >
                        {isLastQuestion ? 'Back' : 'Next'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResult;
