import React, { useCallback, useEffect, useState } from 'react';
import logo from '../../Asserts/Image/logo.png';
import xploretext from '../../Asserts/Image/xploretext.png';
import axiosInstance from '../../axiosInstance';

const QuizTopBar = () => {

    const [course, setCourse] = useState([])
    const [progress, setProgress] = useState({
        totalCorrect: 0,
        totalWrong: 0,
        totalQuizzes: 0,
        percentage: 0
    });

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const course_id = userData[0]?.course_id || '';
    const student_id = userData[0]?.student_id || '';

    const fetchCourse = useCallback(async () => {
        axiosInstance.get(`/courses/viewCourse/${course_id}`).then((res) => {
            setCourse(res.data.course_name)
        }).catch((err) => {
            console.error(err , "Error"); 
        })
    }, [course_id]);
    const fetchProgress = useCallback(async () => {
        if (!course_id || !student_id) return;

        setProgress({
            totalCorrect: 0,
            totalWrong: 0,
            totalQuizzes: 0,
            percentage: 0,
        });

        try {
            const res = await axiosInstance.post('/quizprogress/resultProgress', {
                course_id,
                student_id
            });

            if (res.data) {
                const validQuizzes = res.data.filter(
                    item => item.correct_quiz !== null || item.wrong_quiz !== null
                );

                const totalCorrect = validQuizzes.filter(
                    item => item.correct_quiz !== null
                ).length;

                const totalWrong = validQuizzes.filter(
                    item => item.correct_quiz === null && item.wrong_quiz !== null
                ).length;

                const totalQuizzes = validQuizzes.length;

                setProgress({
                    totalCorrect,
                    totalWrong,
                    totalQuizzes,
                    percentage: totalQuizzes > 0 ? ((totalCorrect / totalQuizzes) * 100).toFixed(2) : 0,
                });
            } else {
                throw new Error('Progress data not found');
            }
        } catch (err) {
            console.error("Error fetching progress:", err);
        }
    }, [course_id, student_id]);


    useEffect(() => {
        fetchCourse();
        fetchProgress();
    }, [fetchCourse, fetchProgress]);

    return (
        <div
            className="bg-white flex flex-col">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-8 sm:h-10 md:h-12 w-auto"
                    />
                    {/* <h1 className='font-bankgothic text-center'>XPLORE IT CORP <br/>
                    <span className='font-astron_boy capitalize'>design your desire</span>
                    </h1> */}
                </div>
            </div>
            <div className='px-20 py-10'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-2xl md:text-3xl'>
                        Review Answers of <br />
                        <span className='text-3xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize'>
                            {course}
                        </span>
                    </h1>
                    <div className="flex justify-center items-center gap-20">
                        <div className="relative size-28">
                            <svg
                                className="size-full -rotate-90"
                                viewBox="0 0 36 36"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient id="gradientStroke1" x1="0%" y1="0%" x2="100%" y2="0%">
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
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="url(#gradientStroke1)"
                                    strokeWidth="1"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - progress.percentage}
                                    strokeLinecap="round"
                                ></circle>
                            </svg>

                            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                <span className="text-center text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                                    {progress.percentage}%
                                </span>
                            </div>
                            <span className='text-slate-600 text-sm text-center inline'>Accuracy Percentage</span>

                        </div>

                        {/* Circle 2 */}
                        <div className="relative size-28">
                            <svg
                                className="size-full -rotate-90"
                                viewBox="0 0 36 36"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient id="gradientStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
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

                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="url(#gradientStroke2)"
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
                            <span className='text-slate-600 text-sm text-center'>Correct Answers</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-5 px-20'>
                <p className='text-slate-500 mb-1'>Finished on: {new Date().toLocaleDateString()}  || {progress.totalQuizzes} Questions</p>
                <div className='border-t-2 border-slate-300 w-full'></div>
            </div>

        </div>
    );
};

export default QuizTopBar;