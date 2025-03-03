import React, { useCallback, useEffect, useState } from "react";
import logo from "../../Asserts/Image/logo.png";
import axiosInstance from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import logout from "../../Asserts/Image/logout btn.svg";

const QuizTopBar = () => {
    const navigate = useNavigate();

    const handleSubmit = () => {
        sessionStorage.removeItem("userData");
        navigate("/login");
    };

    const [course] = useState([]);
    const [category_id, setCategoryId] = useState("");


    
    const [progress, setProgress] = useState({
        totalCorrect: 0,
        totalWrong: 0,
        totalQuizzes: 0,
        percentage: 0
    });

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const student_id = userData[0]?.student_id || "";
    const cwd = userData[0]?.cwq_id || "";

    const fetchCourseWithQuiz = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/newcourse/view/${cwd}`);
            const categoryId = response.data[0]?.category_id || "";
            setCategoryId(categoryId);
        } catch (err) {
            console.error("Error fetching category_id:", err);
        }
    }, [cwd]);

    const fetchProgress = useCallback(async () => {
        if (!category_id || !student_id) {
            console.error("Missing category_id or student_id");
            return;
        }
    
        try {
            const res = await axiosInstance.post("/quizprogress/resultPage", {
                category_id,
                student_id,
            });
    
            if (res.data && Array.isArray(res.data)) {
                const validQuizzes = res.data.filter(
                    (item) =>
                        typeof item.correct_quiz === "number" ||
                        typeof item.wrong_quiz === "number"
                );

                const totalCorrect = validQuizzes.filter(
                    (item) => item.correct_quiz !== null
                ).length;
                const totalWrong = validQuizzes.filter(
                    (item) => item.correct_quiz === null && item.wrong_quiz !== null
                ).length;
                const totalQuizzes = res.data[0].total_quiz;

                setProgress({
                    totalCorrect,
                    totalWrong,
                    totalQuizzes,
                    percentage:
                        totalQuizzes > 0
                            ? ((totalCorrect / totalQuizzes) * 100).toFixed(2)
                            : 0,
                });
            } else {
                console.error("Invalid data format or empty response");
            }
        } catch (err) {
            console.error("Error fetching progress:", err);
        }
    }, [category_id, student_id]);
    
    useEffect(() => {
        fetchCourseWithQuiz();
    }, [fetchCourseWithQuiz]);
    
    useEffect(() => {
        fetchCourseWithQuiz().then(() => {
            if (category_id) {
                fetchProgress();
            }
        });
    }, [category_id, fetchProgress, fetchCourseWithQuiz]);

    return (
        <div className="bg-white flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-16 w-auto" />
                </div>
                <div className="flex items-center gap-3">
                <button className='bg-[#BD76F6] rounded w-24 text-white font-sans p-1' onClick={handleSubmit} >Logout</button>
                </div>
            </div>

            {/* Progress Section */}
            <div className="px-4 sm:px-8 lg:px-20 py-6 sm:py-10">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <h1 className="text-lg sm:text-xl md:text-3xl text-center lg:text-left">
                        Review Answers of <br />
                        <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize">
                            {course}
                        </span>
                    </h1>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        {/* Circle 1 */}
                        <div className="relative size-28">
                            <svg
                                className="size-full -rotate-90"
                                viewBox="0 0 36 36"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="gradientStroke1"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EC4899" />
                                        <stop offset="100%" stopColor="#A855F7" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-gray-200"
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
                                <span className="text-center text-sm sm:text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                                    {progress.percentage}%
                                </span>
                            </div>
                            <span className="text-slate-600 text-xs sm:text-sm text-center">
                                AccuracyPercentage
                            </span>
                        </div>

                        {/* Circle 2 */}
                        <div className="relative size-28">
                            <svg
                                className="size-full -rotate-90"
                                viewBox="0 0 36 36"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="gradientStroke2"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#EC4899" />
                                        <stop offset="100%" stopColor="#A855F7" />
                                    </linearGradient>
                                </defs>

                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-gray-200"
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
                                <span className="text-center text-sm sm:text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                                    {progress.totalCorrect}/{progress.totalQuizzes}
                                </span>
                            </div>
                            <span className="text-slate-600 text-xs sm:text-sm text-center">
                                Correct Answers
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-5 px-4 sm:px-8 lg:px-20">
                <p className="text-slate-500 mb-1 text-center lg:text-left">
                    Finished on: {new Date().toLocaleDateString()} || {progress.totalQuizzes} Questions
                </p>
                <div className="border-t-2 border-slate-300 w-full"></div>
            </div>

        </div>
    );
};

export default QuizTopBar;