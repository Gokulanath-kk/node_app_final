import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';

const StudentGetScoreIndex = () => {
    const navigate = useNavigate();
    const [course, setCourse] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [progress, setProgress] = useState({
        totalCorrect: 0,
        totalWrong: 0,
        totalQuizzes: 0,
        percentage: 0,
    });

    const userData = JSON.parse(sessionStorage.getItem("userData") || '[]');
    const studentId = userData[0]?.student_id || '';
    const cwdId = userData[0]?.cwq_id || '';

    const fetchCourseWithQuiz = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/newcourse/view/${cwdId}`);
            const courseData = response.data[0] || {};
            setCourse(courseData.course_id || '');
            setCategoryId(courseData.category_id || '');
        } catch (err) {
            console.error("Error fetching course with quiz:", err);
        }
    }, [cwdId]);

      const fetchProgress = useCallback(async () => {
        if (!categoryId || !studentId) {
            console.error("Missing category_id or student_id");
            return;
        }

        try {
            const res = await axiosInstance.post('/quizprogress/resultProgress', {
                category_id: categoryId,
                student_id: studentId
            });

            if (Array.isArray(res.data) && res.data.length > 0) {
                const validQuizzes = res.data.filter(item => 
                    typeof item.correct_quiz === "number" || 
                    typeof item.wrong_quiz === "number"
                );

                const totalCorrect = validQuizzes.filter(item => item.correct_quiz !== null).length;
                const totalWrong = validQuizzes.filter(item => 
                    item.correct_quiz === null && item.wrong_quiz !== null
                ).length;
                const totalQuizzes = res.data[0]?.total_quiz || 0;

                setProgress({
                    totalCorrect,
                    totalWrong,
                    totalQuizzes,
                    percentage: totalQuizzes > 0 ? Number(((totalCorrect / totalQuizzes) * 100).toFixed(2)) : 0,
                });
            }
        } catch (err) {
            console.error("Error fetching progress:", err);
        }
    }, [categoryId, studentId]);


    const fetchCourse = useCallback(async () => {
        if (!course) return;

        try {
            const response = await axiosInstance.get(`/courses/viewCourse/${course}`);
            setCourse(response.data[0].course_name || '');
            console.log(response.data[0].course_name);
            
        } catch (err) {
            console.error("Error fetching course:", err);
        }
    }, [course]);

    useEffect(() => {
        fetchCourseWithQuiz();
    }, [fetchCourseWithQuiz]);

    useEffect(() => {
        if (categoryId) {
            fetchProgress();
        }
    }, [categoryId, fetchProgress]);

    useEffect(() => {
        if (course) {
            fetchCourse();
        }
    }, [course, fetchCourse]);

    const viewQuizAns = () => {
        console.log(course, "Course")
        if (course) {
            navigate(`/${course}/viewquiz-results`)
        }
    }
    const restart = () => {
        navigate('/landingIndex')
    }

    const getEmojiDetails = () => {
        if (progress.percentage > 80) {
            return {
                emoji: '🎉',
                text: 'Excellent!',
                animationClass: 'animate-bounce duration-300 hover:scale-125 transition-transform'
            };
        } else if (progress.percentage > 50) {
            return {
                emoji: '😊',
                text: 'Good Job!',
                animationClass: 'animate-bounce hover:rotate-6 transition-transform'
            };
        } else {
            return {
                emoji: '😞',
                text: 'Keep Trying',
                animationClass: 'animate-wiggle hover:scale-110 transition-transform'
            };
        }
    };

    const emojiDetails = getEmojiDetails();

    return (
        <>
            <div className=' font-serif'>
                <div className='text-3xl mt-5 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text text-center justify-center '>
                    Your Results
                </div>
                <div className="flex py-10 justify-center">

                    <div className="relative sm:w-32 sm:h-32 md:w-40 md:h-40 bg-purple-500 rounded-b-[50%] border border-t">
                        <div className="absolute bottom-0 left-1/2 w-full h-[1px] bg-purple-600"></div>
                        <div className="relative text-center  text-white mt-5">
                            <div className={`text-6xl ${emojiDetails.animationClass}`}>
                                {emojiDetails.emoji}
                            </div>
                            <div className="sm:text-sm  md:text-xl  mt-2   font-semibold">
                                {emojiDetails.text}
                            </div>
                        </div>
                    </div>
                    <div className="flex1  border-t border-e border-b border-purple-600">

                        <div className="sm:w-128 md:w-128">
                            <div className="flex justify-center -py-1 sm:items-none  sm:gap-10 sm:-py-0  md:items-center md:gap-20 ">
                                <div className="relative sm:size-32 md:size-32  ">
                                    <svg
                                        className="sm:size-full  md:size-full    -rotate-90  "
                                        viewBox="0 0 36 36"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <defs>
                                            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">

                                                <stop offset="0%" stopColor="#EC4899" />
                                                <stop offset="100%" stopColor="#A855F7" />
                                            </linearGradient>
                                        </defs>

                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            className="stroke-current text-gray-200 dark:text-neutral-700"
                                            strokeWidth="1"
                                        ></circle>

                                        {/* Progress Circle */}
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            stroke="url(#gradientStroke)"
                                            strokeWidth="1"
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - progress.percentage}
                                            strokeLinecap="round"
                                        ></circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                        <span className="text-center sm:text-xs md:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                                            {progress.percentage}%
                                        </span>
                                    </div>
                                    <span className='text-slate-600 text-sm text-center   '>AccuracyPercentage</span>
                                </div>

                                {/* Circle 2 */}
                                <div className="relative sm:size-32 md:size-32  ">
                                    <svg
                                        className="sm:size-full  md:size-full    -rotate-90  "
                                        viewBox="0 0 36 36"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <defs>
                                            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">

                                                <stop offset="0%" stopColor="#EC4899" />
                                                <stop offset="100%" stopColor="#A855F7" />
                                            </linearGradient>
                                        </defs>

                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            className="stroke-current text-gray-200 dark:text-neutral-700"
                                            strokeWidth="1"
                                        ></circle>

                                        {/* Progress Circle */}
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="none"
                                            stroke="url(#gradientStroke)"
                                            strokeWidth="1"
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - progress.percentage}
                                            strokeLinecap="round"
                                        ></circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                        <span className="text-center text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                                            {progress.totalCorrect}/{progress.totalQuizzes}
                                        </span>
                                    </div>
                                    <span className='text-slate-600 text-sm text-center  ml-2 '>Correct Answers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className='flex py-10 justify-center'>
                    <button className='flex  bg-lite px-2 py-2 rounded-lg text-white gap-3 ' onClick={viewQuizAns}>
                        View Answers
                        <span>{`>`}</span>
                    </button>
                    <button className=' ml-4 flex  bg-lite px-6 py-2 rounded-lg text-white gap-3' onClick={restart}>
                        Restart
                        <span>{`>`}</span>
                    </button>
                </div>

            </div>
        </>
    );
};

export default StudentGetScoreIndex;
