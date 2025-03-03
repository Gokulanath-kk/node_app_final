import React, { useCallback, useEffect, useState } from 'react';
import mainInstructionIndex from '../../Asserts/Image/mainIndexbg.png';
import card from '../../Asserts/Image/StudentMainIndexCard.png';
import { ArrowUpRight, Book, BookMarked, Menu, Star, Timer } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { TbSpeakerphone } from 'react-icons/tb';
import { CiCircleInfo } from 'react-icons/ci';

const StudentInstructionPage = () => {

    const navigate = useNavigate()

    const [courseName, setCourseName] = useState([])
    const [totalquiz, settotalquiz] = useState([])
    const [quiz, setQuiz] = useState([])

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const course_id = userData[0]?.cwq_id || '';
console.log(course_id);



    const fetchCourseName = useCallback(async () => {

console.log(course_id , "");

        try {
            const response = await axiosInstance.get(`/newcourse/view/${course_id}`);
            setCourseName(response.data.course_id);  
            
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    }, [course_id])

    const fetchTotalQuiz = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/newcourse/view/${course_id}`);
            settotalquiz(response.data.no_of_questions);
            console.log(response.data.no_of_questions , "response.data.no_of_questions");
            
        } catch (error) {
            console.error('Error fetching total quizzes:', error);
        }
    }, [course_id])

    const fetchquiz = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/quiz/coursequiz/${course_id}`)
            setQuiz(response.data)
        }
        catch (error) {
            console.error("err", error)
        }
    }, [course_id])

    useEffect(() => {
        fetchCourseName();
        fetchTotalQuiz();
        fetchquiz();
    }, [fetchCourseName, fetchTotalQuiz, fetchquiz]);


    const handleTakeQuiz = () => {
        if (quiz && quiz.length > 0) {
            const firstQuizId = quiz[0]?.Quiz_id;
            if (firstQuizId) {
                navigate(`/${courseName}/quiz`);
            } else {
                alert('Quiz ID is not available');
            }
        } else {
            alert('No quizzes available for this course');
        }
    };

    return (
        <div
        className="relative min-h-screen bg-no-repeat bg-cover bg-center xl:bg-none lg:bg-none md:bg-center sm:bg-center "
        style={{ backgroundImage: `url(${mainInstructionIndex})` }}
      >
            <span className='absolute top-4 right-4 md:top-12 md:right-10 transform text-white rotate-[20deg]'>
                <BookMarked
                    className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-[120px] xl:h-[120px]"
                />
            </span>
            <span className='absolute left-4 top-40 md:left-0 md:top-60 rotate-[-20deg] text-white'>
                <TbSpeakerphone
                    className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-[200px] xl:h-[200px]"
                />
            </span>

            <div className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 min-h-screen">
                <div className="text-center xl:mt-5 lg:mt-5">
                    <h2 className="text-2xl  sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600">
                        Xplore IT Corp
                    </h2>

                    <ul className="mt-20 text-left tracking-widest leading-relaxed space-y-3 sm:space-y-4 list-disc  
              px-4 sm:px-10 md:px-20 lg:px-28 xl:px-36 
              text-xs sm:text-sm md:text-base lg:text-lg">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <li key={item} className="mb-2 sm:mb-3 text-slate-600">
                                Lorem ipsum dolor sit amet consectetur. Ullamcorper id adipiscing consectetur euismod bibendum ullamcorper.
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl mt-8 sm:mt-10 relative">
                    <img src={card} alt="cardimage" className="w-full" />
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around items-center px-2 sm:px-4 md:px-10 lg:px-20 py-3">
                        <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 w-full">
                            {[
                                { icon: <Book size={12} className="sm:size-[15px]" />, label: "Name of the course", value: courseName },
                                { icon: <Menu size={12} className="sm:size-[15px]" />, label: "Total number of questions", value: `${totalquiz}  quizs` },
                                { icon: <Timer size={12} className="sm:size-[15px]" />, label: "Maximum Time", value: "10 mins" },
                                { icon: <Star size={12} className="sm:size-[15px]" />, label: "Total Points", value: "10 point" }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between w-full 
                      px-2 sm:px-4 md:px-10 lg:px-20 xl:px-40"
                                >
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <div className="flex bg-purple-800 text-white p-1 sm:p-2 rounded">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm text-white">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-white gap-2 sm:gap-4 md:gap-10 lg:gap-20 xl:gap-32">
                                        <span className="text-center text-xs sm:text-sm">:</span>
                                        <span className="text-right text-[10px] sm:text-xs md:text-sm capitalize">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className=' sm:mt-6  max-w-xs sm:max-w-sm pb-5'>
                    <button
                        className='flex items-center gap-2 w-full justify-center bg-white 
                text-xs sm:text-sm md:text-base text-gray-600 
                px-4 sm:px-12 lg:px-20 md:px-16 py-2 rounded 
                hover:bg-gray-100 transition-colors'
                        onClick={handleTakeQuiz}
                    >
                        Take Quiz <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <span className='absolute bottom-4 left-4 text-white rotate-[20deg]'>
                    <CiCircleInfo
                        className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-[200px] xl:h-[200px]"
                    />
                </span>
            </div>
        </div>

    );
};

export default StudentInstructionPage;
