import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CircleHelp,  Timer } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const TOTAL_QUIZ_TIME = 3600;

const StudentQuiz = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const student_id = userData[0]?.student_id || '';
    const cwq_id = userData[0]?.cwq_id || '';
    const [randomQuiz , setrandomQuiz] = useState([])
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME);
    const [submissionError, setSubmissionError] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryId, setCategoryId] = useState(null);
    const [courseId, setCourseId] = useState(null);
    const [submittedQuizIds, setSubmittedQuizIds] = useState(new Set());
    const isUpdateProgressCalled = useRef(false)
    const [quizSession, setQuizSession] = useState({
        startTime: new Date().toISOString(),
        attempts: []
    });

    const shuffleArray = (array) => {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    };

    const currentQuiz = quizzes[currentQuizIndex];
    const isLastQuestion = currentQuizIndex === quizzes.length - 1;

    const fetchCourseAndQuizData = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/newcourse/view/${cwq_id}`);
            const courseData = response.data[0];
            
            if (courseData) {
                setrandomQuiz(courseData.no_of_questions)
                setCategoryId(courseData.category_id);
                setCourseId(courseData.course_id);
                setCourse(courseData);
            }
        } catch (error) {
            console.error("Error fetching course with quiz data:", error);
            setError("Failed to load course data");
        }
    }, [cwq_id]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        fetchCourseAndQuizData();
    }, [fetchCourseAndQuizData]);

    useEffect(() => {
        if (quizzes.length > 0) {
            const calculatedProgress = Math.round(((currentQuizIndex + 1) / quizzes.length) * 100);
            setProgress(calculatedProgress);
        }
    }, [currentQuizIndex, quizzes.length]);

    const fetchQuizzes = useCallback(async () => {
        if (!categoryId) {
            setError('Category ID is required');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/quiz/category/${categoryId}`);
            
            const quizData = response.data.map(quiz => {
                let options = [];
                let correctAnswer = null;

                try {
                    options = typeof quiz.quiz_options === 'string'
                        ? JSON.parse(quiz.quiz_options)
                        : quiz.quiz_options || [];
                    
                    correctAnswer = JSON.parse(quiz.quiz_correct_answer)[0]?.id;
                } catch (parseError) {
                    console.error('Error parsing quiz data:', parseError);
                }

                return {
                    ...quiz,
                    originalId: quiz.quiz_id,
                    options,
                    correctAnswer,
                };
            });

            const randomizedQuizzes = shuffleArray(quizData).slice(0, randomQuiz);
            
            setQuizzes(randomizedQuizzes);
            setCurrentQuizIndex(0);
        } catch (err) {
            setError(err.message || 'Failed to load quiz questions');
        } finally {
            setLoading(false);
        }
    }, [categoryId, randomQuiz]);

    useEffect(() => {
        if (categoryId) {
            fetchQuizzes();
        }
    }, [categoryId, fetchQuizzes]);

    const handleNext = useCallback(() => {
        if (selectedAnswer === null) return;

        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else if (isLastQuestion) {
            setShowSubmitModal(true);
        }
    }, [currentQuizIndex, isLastQuestion, quizzes.length, selectedAnswer]);

    const updateProgress = useCallback(async () => {
        if (!categoryId || !student_id || quizSession.attempts.length === 0) return;

        try {
            const uniqueAttemptsMap = new Map();
            quizSession.attempts.forEach(attempt => {
                uniqueAttemptsMap.set(attempt.quiz_id, attempt);
            });
            const uniqueAttempts = Array.from(uniqueAttemptsMap.values());

            const results = uniqueAttempts.map(attempt => {
                const quiz = quizzes.find(q => q.quiz_id === attempt.quiz_id);
                return {
                    student_id,
                    category_id: categoryId,
                    total_quiz: randomQuiz,
                    quiz_id: attempt.quiz_id,
                    wrong_quiz: attempt.selected_option_id !== quiz.correctAnswer ? attempt.selected_option_id : null,
                    correct_quiz: attempt.selected_option_id === quiz.correctAnswer ? quiz.correctAnswer : null,
                };
            });

            console.log('Submitting unique results:', results);
            
            const response = await axiosInstance.post('/quizprogress/updateProgress', { results });
            console.log(response,'....response......');

            if (response.status === 200) {
                setShowSubmitModal(false);
                navigate(`/${courseId}/student-result`);
            }
        } catch (error) {
            setSubmissionError(error.response?.data?.error || 'Failed to submit quiz results');
            console.error('Failed to update progress:', error);
        }
    }, [categoryId, student_id, quizSession.attempts, quizzes, randomQuiz, courseId, navigate]);

    const handleTimeUp = () => {
        // Prevent multiple calls
        if (isUpdateProgressCalled.current) return;

        const unsubmittedAttempts = quizSession.attempts.filter(
            attempt => !submittedQuizIds.has(attempt.quiz_id)
        );
        console.log(unsubmittedAttempts, "unsubmittedAttempts");

        if (unsubmittedAttempts.length > 0) {
            isUpdateProgressCalled.current = true; // Mark as called
            updateProgress();
        } else {
            // If all attempts are already submitted, just navigate to results
            isUpdateProgressCalled.current = true; // Mark as called
            navigate(`/${courseId}/student-result`);
        }
    };

    useEffect(() => {
        let timer;
        if (timeLeft > 0 && !showSubmitModal) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, showSubmitModal, handleTimeUp]);

   
  

    const handleAnswerSelect = useCallback((optionId) => {
        if (!currentQuiz) return;

        const isCorrect = optionId === currentQuiz.correctAnswer;

        setQuizSession(prev => {
            // Remove any previous attempt for this quiz
            const filteredAttempts = prev.attempts.filter(
                a => a.quiz_id !== currentQuiz.quiz_id
            );

            // Add the new attempt
            return {
                ...prev,
                attempts: [
                    ...filteredAttempts,
                    {
                        quiz_id: currentQuiz.quiz_id,
                        selected_option_id: optionId,
                        is_correct: isCorrect,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
        });

        setSelectedAnswer(optionId);
    }, [currentQuiz]);

    

    const handlePrevious = useCallback(() => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(prev => prev - 1);
            const previousAttempt = quizSession.attempts.find(
                a => a.quiz_id === quizzes[currentQuizIndex - 1].quiz_id
            );
            setSelectedAnswer(previousAttempt?.selected_option_id || null);
        }
    }, [currentQuizIndex, quizSession.attempts, quizzes]);

    const handleUpdate = () => {
        if (course) {
            updateProgress();
            setShowSubmitModal(false);
            navigate(`/${courseId}/student-result`);
        } else {
            console.error("Course not found, cannot navigate.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
            </div>
        );
    }

    const options = Array.isArray(currentQuiz?.options)
        ? currentQuiz.options
        : typeof currentQuiz?.options === 'string'
            ? JSON.parse(currentQuiz.options)
            : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 ">
            <div className="relative bg-gray-200 h-1 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-purple-500 transition-all"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="font-sans bg-white rounded-md shadow-sm ">
                <div className="border-b border-gray-200  justify-around bg-purple-100 rounded-t">
                    <div className="flex justify-between px-5 py-2 ">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {quizzes.length > 0
                                ? `Question : ${currentQuizIndex + 1}`
                                : "No Quiz Selected"}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Timer className="w-5 h-5 text-orange-600" />
                            <span className="font-mono text-lg font-medium">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="font-sans px-6 py-2 bg-purple-100">
                    <h3 className="text-lg font-medium text-gray-900  mb-6">
                        {currentQuiz?.quiz_question}
                    </h3>
                    <div className="space-y-3">
                        {Array.isArray(options) && options.length > 0 ? (
                            options.map((option, index) => {
                                const optionLabel = String.fromCharCode(65 + index);
                                const isSelected = selectedAnswer === option.id;
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(option.id)}
                                        className={`flex items-center gap-4 p-3 rounded-md border cursor-pointer 
                                        ${isSelected 
                                            ? 'bg-purple-500 border-white text-white' 
                                            : 'bg-purple-300 hover:bg-purple-500 border-purple-400 text-gray-950 text-lg'}`}
                                    >
                                        <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                                            ${isSelected 
                                                ? 'border-white text-indigo-600' 
                                                : 'border-slate-400 text-slate-400'}`}
                                        >
                                            <span className="font-medium text-inherit">{optionLabel}</span>
                                        </div>
                                        <p>{option.text}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No options available</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
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
                <span className="text-gray-600 hidden md:block">
                    Question {currentQuizIndex + 1} / {quizzes.length}
                </span>
                <button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${selectedAnswer === null
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-lite text-white '}`}
                >
                    {isLastQuestion ? 'Finish' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            {showSubmitModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-white/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-b from-purple-500 to-pink-500 justify-center min-w-96 min-h-60 p-6 rounded-md space-y-4">
                        <span className='flex justify-center text-white'><CircleHelp size={50} /></span>
                        <p className="text-white text-center">Are you sure <br /> you want to submit your answers?</p>
                        <div className="flex justify-around space-x-4 pt-5">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-4 py-2 border border-white text-white rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-blue-600 bg-white text-purple-600 font-bold rounded-md"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentQuiz;