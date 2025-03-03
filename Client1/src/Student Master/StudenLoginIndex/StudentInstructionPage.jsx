import React, { useCallback, useEffect, useState } from 'react';
import mainInstructionIndex from '../../Asserts/Image/mainIndexbg.png';
import card from '../../Asserts/Image/StudentMainIndexCard.png';
import { ArrowUpRight, Book, BookMarked, Menu, Star, Timer } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { TbSpeakerphone } from 'react-icons/tb';
import { CiCircleInfo } from 'react-icons/ci';

const StudentInstructionPage = () => {
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [totalquiz, setTotalQuiz] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [category, setCategoryId] = useState('');
  const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
  const course_id = userData[0]?.cwq_id || '';

  const fetchCourseName = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/newcourse/view/${course_id}`);
      const courseData = response.data[0];
      setCourseName(courseData?.course_college_name || '');
      setTotalQuiz(courseData?.no_of_questions || 0);
      setCategoryId(courseData?.category_id || '');
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  }, [course_id]);

  const fetchquiz = useCallback(async () => {
    try {
      if (!category) return;
      const response = await axiosInstance.get(`/quiz/category/${category}`);
      setQuiz(response.data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, [category]);

  useEffect(() => {
    fetchCourseName();
  }, [fetchCourseName]);

  useEffect(() => {
    if (category) {
      fetchquiz();
    }
  }, [category, fetchquiz]);

  const handleTakeQuiz = () => {
    if (quiz.length > 0) {
      const firstQuizId = quiz[0]?.quiz_id;
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
      className="z-10 relative min-h-screen bg-no-repeat bg-cover bg-center xl:bg-none lg:bg-none md:bg-center sm:bg-center"
      style={{ backgroundImage: `url(${mainInstructionIndex})` }}
    >
      <span className='absolute top-4 right-4 md:top-12 md:right-10 transform text-white rotate-[20deg]'>
        <BookMarked
          className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-[120px] xl:h-[120px]"
        />
      </span>

      <div className="z-10 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 min-h-screen">
        <div className="text-center xl:mt-5 lg:mt-5">
          <h2 className="font-unbounded text-2xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-600">
            Know Before You Go!!!
          </h2>
          {[1].map((item) => (
            <ul key={item} className="sm:text-left font-sans mt-12 text-left tracking-widest leading-relaxed space-y-3 sm:space-y-4 list-disc px-4 sm:px-10 md:px-20 lg:px-28 xl:px-36 text-xs sm:text-sm md:text-base lg:text-lg">
              <li className="font-sans mb-2 sm:mb-3 sm:text-start text-slate-600 text-justify">
                Login 10 minutes before your scheduled time using Chrome/Firefox with a stable internet connection. Keep your ID ready for identity verification through our secure portal.
              </li>
              <li className="font-sans mb-2 sm:mb-3 text-slate-600 text-justify">
                Choose a distraction-free environment where you can focus completely on your evaluation. You can use plain paper and a pen to work out the questions.
              </li>
              <li className="font-sans mb-2 sm:mb-3 text-slate-600 text-justify">
                Remain within the test window at all times. The system will automatically flag any attempts to open new tabs or exit the full-screen mode during the evaluation.
              </li>
              <li className="font-sans mb-2 sm:mb-3 text-slate-600 text-justify">
                Use the 'Save' button frequently to secure your progress. If you encounter technical difficulties, immediately reach out through the support chat while staying on the test window.
              </li>
              <li className="font-sans mb-2 sm:mb-3 text-slate-600 text-justify">
                Double-check all your answers before submitting. Once you click the final 'Submit' button, wait for the confirmation message. Wait patiently for your scorecard to display.
              </li>
            </ul>
          ))}
        </div>

        <span className='z-0 absolute left-4 top-40 md:left-0 md:top-60 rotate-[-20deg] text-white'>
          <TbSpeakerphone
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-[200px] xl:h-[200px]"
          />
        </span>

        <div className="z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl mt-8 relative">
          <img src={card} alt="cardimage" className="w-full" />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-start px-2 sm:px-4 md:px-10 lg:px-20 py-3">
            <div className="font-sans flex flex-col items-start space-y-4 w-full">
              {[
                { icon: <Book size={12} className="sm:size-[15px]" />, label: "Name of the course", value: `${courseName}` },
                { icon: <Menu size={12} className="sm:size-[15px]" />, label: "Total number of questions", value: `${totalquiz} quiz` },
                { icon: <Timer size={12} className="sm:size-[15px]" />, label: "Maximum Time", value: "10 mins" },
                { icon: <Star size={12} className="sm:size-[15px]" />, label: "Total Points", value: "10 points" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center w-full px-2 sm:px-4 md:px-10 lg:px-12 xl:px-16 gap-2"
                >
                  {/* Icon and Label */}
                  <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-2">
                    <div className="flex bg-purple-800 text-white p-2 rounded">
                      {item.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm text-white">
                      {item.label}
                    </span>
                  </div>
                  {/* Colon */}
                  <div className="flex justify-center text-white">
                    <span className="text-lg font-bold">:</span>
                  </div>
                  {/* Value */}
                  <div className="flex items-center justify-start text-white pl-2 sm:pl-4 md:pl-6 lg:pl-8">
                    <span className="text-[10px] sm:text-xs md:text-sm capitalize">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='sm:mt-6 max-w-xs sm:max-w-sm pb-5'>
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

        <span className='z-0 absolute bottom-4 left-4 text-white rotate-[20deg]'>
          <CiCircleInfo
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-[200px] xl:h-[200px]"
          />
        </span>
      </div>
    </div>
  );
};

export default StudentInstructionPage;







