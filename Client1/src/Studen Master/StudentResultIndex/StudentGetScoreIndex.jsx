import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import { BiLeftArrow } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const StudentGetScoreIndex = () => {
    const navigate = useNavigate()

    const [course, setCourse] = useState([]);
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
        if (!course_id) return;

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

    const viewQuizAns = () => {
        console.log(course , "Course")
        if(course) {
            navigate(`/${course}/viewquiz-results`)
        }
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
            <div className=' '>
                <div className='text-3xl mt-5 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text text-center '>
                    Your Results
                </div>
                <div className=" flex py-10 justify-center " >

                    <div className="relative w-40 h-40 bg-purple-500 rounded-b-[50%] border border-t  ">
                        <div className="absolute bottom-0 left-1/2 w-full h-[1px] bg-purple-600  "></div>
                        <div className="relative text-center  text-white mt-5">
                            <div className={`text-6xl ${emojiDetails.animationClass}`}>
                                {emojiDetails.emoji}
                            </div>
                            <div className="text-xl mt-2 font-semibold">
                                {emojiDetails.text}
                            </div>
                        </div>
                    </div>
                    <div className="flex1  border-t border-e border-b border-purple-600">

                        <div className="w-96">
                            <div className="flex justify-center items-center gap-20 -py-1">

                                <div className="relative size-32">
                                    <svg
                                        className="size-full -rotate-90"
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
                                            {progress.percentage}%
                                        </span>
                                    </div>
                                    <span className='text-slate-600 text-sm text-center'>Accuracy Percentage</span>
                                </div>
                                {/* Circle 2 */}
                                <div className="relative size-32">
                                    <svg
                                        className="size-full -rotate-90"
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
                                    <span className='text-slate-600 text-sm text-center'>Correct Answers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div className='flex py-10 justify-center'>
                <button className='flex  bg-lite px-6 py-2 rounded-lg text-white gap-3 ' onClick={viewQuizAns}>
                    View Answers
                    <span>{`>`}</span>
                </button>
                </div>
                
            </div>
        </>
    );
};

export default StudentGetScoreIndex;
