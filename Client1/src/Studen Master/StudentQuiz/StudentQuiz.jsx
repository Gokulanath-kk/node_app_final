import React, { useState, useEffect, useCallback } from 'react';
import { json, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CircleHelp, Info, Star, Timer, X } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const TIMER_DURATION = 30;

const StudentQuiz = ({ selectedQuizId, onCurrentQuizChange }) => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const topicId = userData[0]?.course_id || '';
    const student_id = userData[0]?.student_id || '';

    const [quizzes, setQuizzes] = useState([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [showResults] = useState(false);
    const [submissionErro, setSubmissionError] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [course, setCourse] = useState([]);
    const [randomQuizIds, setRandomQuizIds] = useState([]);
    const [progress, setProgress] = useState(0);
    const [originalQuizOrder, setOriginalQuizOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [quizSession, setQuizSession] = useState({
        startTime: new Date().toISOString(),
        attempts: []
    });

    const currentQuiz = quizzes[currentQuizIndex];
    const isLastQuestion = currentQuizIndex === quizzes.length - 1;



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    const fetchCourse = useCallback(async () => {
        axiosInstance.get(`/courses/viewCourse/${topicId}`).then((res) => {
            setCourse(res.data.course_name);
        }).catch((err) => {
            console.log(err , "Error")
        })
    }, [topicId]);

    
    useEffect(() => {
        if (quizzes.length > 0) {
            const calculatedProgress = Math.round(((currentQuizIndex + 1) / quizzes.length) * 100);
            setProgress(calculatedProgress);
            console.log(`Progress: ${calculatedProgress}%, Current Index: ${currentQuizIndex}, Total Quizzes: ${quizzes.length}`);
        }
    }, [currentQuizIndex, quizzes.length]);

    // Optional: Initial progress setting
    useEffect(() => {
        if (quizzes.length > 0) {
            setProgress(((currentQuizIndex + 1) / quizzes.length) * 100);
        }
    }, [quizzes, currentQuizIndex]);
    const fetchQuizzes = useCallback(async () => {
        if (!topicId && !selectedQuizId) {
            setError('Either Topic ID or Selected Quiz ID is required');
            return;
        }

        setLoading(true);
        try {
            let response; // Declare response variable here
            if (selectedQuizId) {
                response = await axiosInstance.get(`/quiz/coursequiz/${topicId}`);
                const quizData = response.data.map(quiz => ({
                    ...quiz,
                    originalId: quiz.Quiz_id,
                    options: typeof quiz.quiz_option === 'string'
                        ? JSON.parse(quiz.quiz_option)
                        : quiz.quiz_option,
                    correctAnswer: JSON.parse(quiz.Quiz_Correct_ans)[0]?.id,
                }));

                const selectedQuizIndex = quizData.findIndex(quiz => quiz.Quiz_id === parseInt(selectedQuizId));

                if (selectedQuizIndex !== -1) {
                    const shuffledQuizData = shuffleQuizzes(quizData);
                    setQuizzes(shuffledQuizData);
                    setCurrentQuizIndex(selectedQuizIndex);
                } else {
                    throw new Error('Selected quiz not found in the course quizzes');
                }
            } else if (topicId) {
                response = await axiosInstance.get(`/quiz/coursequiz/${topicId}`);

                const quizData = response.data
                    .map(quiz => ({
                        ...quiz,
                        originalId: quiz.Quiz_id,
                        options: typeof quiz.quiz_option === 'string'
                            ? JSON.parse(quiz.quiz_option)
                            : quiz.quiz_option,
                        correctAnswer: JSON.parse(quiz.Quiz_Correct_ans)[0]?.id,
                    }));

                const shuffledQuizData = shuffleQuizzes(quizData);
                setQuizzes(shuffledQuizData);
            }
        } catch (err) {
            setError(err.message || 'Failed to load quiz questions');
        } finally {
            setLoading(false);
        }
    }, [topicId, selectedQuizId]);


    const updateProgress = useCallback(async () => {
        if (!topicId || !student_id || quizSession.attempts.length === 0) return;

        try {
            const userData = JSON.parse(sessionStorage.getItem("userData"));

            const results = quizSession.attempts.map(attempt => {
                const quiz = quizzes.find(q => q.Quiz_id === attempt.quiz_id);
                return {
                    student_id: userData?.[0]?.student_id,
                    course_id: userData?.[0]?.course_id,
                    Quiz_id: attempt.quiz_id,
                    wrong_quiz: attempt.selected_option_id !== quiz.correctAnswer ? attempt.selected_option_id : null,
                    correct_quiz: attempt.selected_option_id === quiz.correctAnswer ? quiz.correctAnswer : null,
                };
            });
            const response = await axiosInstance.post('/quizprogress/updateProgress', { results });

            if (response.status === 200) {
                setShowSubmitModal(false);
            }
        } catch (error) {
            setSubmissionError(error.response?.data?.error || 'Failed to submit quiz results');
            console.error('Failed to update progress:', error);
        }
    }, [topicId, quizSession.attempts, quizzes]);


    const shuffleQuizzes = (quizArray) => {
        const shuffledArray = [...quizArray];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    };

    useEffect(() => {
        let timer;
        if (timeLeft > 0 && !showResults) {
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
    }, [timeLeft, showResults]);

    useEffect(() => {
        fetchCourse();
        fetchQuizzes();
    }, [fetchQuizzes, fetchCourse]);

    const handleTimeUp = useCallback(() => {
        if (!isLastQuestion) {
            handleNext();
        } else {
            updateProgress();
        }
    }, [isLastQuestion, updateProgress]);

    const handleAnswerSelect = useCallback((optionId) => {
        if (!currentQuiz) return;

        const isCorrect = optionId === currentQuiz.correctAnswer;

        setQuizSession(prev => ({
            ...prev,
            attempts: [
                ...prev.attempts.filter(a => a.quiz_id !== currentQuiz.Quiz_id),
                {
                    quiz_id: currentQuiz.Quiz_id,
                    selected_option_id: optionId,
                    is_correct: isCorrect,
                    timestamp: new Date().toISOString()
                }
            ]
        }));

        setSelectedAnswer(optionId);
    }, [currentQuiz]);

    const handleNext = useCallback(() => {
        if (selectedAnswer === null) return;

        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setTimeLeft(TIMER_DURATION);
        } else if (isLastQuestion) {
            setShowSubmitModal(true);
        }
    }, [currentQuizIndex, isLastQuestion, quizzes.length, selectedAnswer]);

    const handlePrevious = useCallback(() => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(prev => prev - 1);
            const previousAttempt = quizSession.attempts.find(
                a => a.quiz_id === quizzes[currentQuizIndex - 1].Quiz_id
            );
            setSelectedAnswer(previousAttempt?.selected_option_id || null);
            setTimeLeft(TIMER_DURATION);
        }
    }, [currentQuizIndex, quizSession.attempts, quizzes]);

    const handleUpdate = () => {
        if (course) {
            updateProgress();
            setShowSubmitModal(false);
            if (course) {
                navigate(`/${course}/student-result`);
            }
        } else {
            console.error("Course name not found, cannot navigate.");
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
        <div className="max-w-4xl mx-auto p-4 space-y-6 ">
            <div className="relative bg-gray-200 h-1 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-purple-500 transition-all"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="bg-white rounded-md shadow-sm ">
                <div className="border-b border-gray-200 p-4 bg-purple-100 rounded-t">
                    <div className="flex justify-between items-center ">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {quizzes.length > 0
                                ? `Question : ${currentQuizIndex + 1}`
                                : "No Quiz Selected"}
                        </h2>

                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">Points:</span>
                            <span className="flex items-center gap-1">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="text-lg font-semibold">1</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="w-5 h-5 text-orange-600" />
                            <span className="font-mono text-lg font-medium">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-2 bg-purple-100">
                    <h3 className="text-lg font-medium text-gray-900  mb-6">
                        {currentQuiz?.Quiz_Question}
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
            ${isSelected ? 'bg-purple-500 border-white text-white' : 'bg-purple-300  hover:bg-purple-500 border-purple-400 text-gray-950 text-lg'}`}
                                    >
                                        <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
              ${isSelected ? 'border-white text-indigo-600' : 'border-slate-400  text-slate-400'}`}
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
                    <div class="bg-gradient-to-b from-purple-500 to-pink-500 justify-center min-w-96 min-h-60 p-6 rounded-md space-y-4">

                        <span className='flex justify-center text-white '><CircleHelp size={50} /></span>
                        <p class="text-white text-center">Are you sure <br /> you want to submit your answers?</p>
                        <div class="flex justify-around space-x-4 pt-5">
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