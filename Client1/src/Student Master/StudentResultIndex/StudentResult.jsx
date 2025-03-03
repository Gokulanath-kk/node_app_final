import React from 'react';
import herobg from '../../Asserts/Image/whiteblurbg.png';
import logo from '../../Asserts/Image/logo.png';
import Result from '../../Asserts/Image/StudentResultRightBg.png';
import { FaUsers } from 'react-icons/fa6';
import { LiaCertificateSolid } from 'react-icons/lia';
import { MdOutlinePlayLesson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';


const StudentResult = () => {
     const navigate = useNavigate()
    
        const handleSubmit = () =>{
            sessionStorage.removeItem("userData");
            navigate('/login');
        }
    return (
        <div
            className="min-h-screen bg-cover bg-center flex flex-col"
            style={{
                backgroundImage: `url(${herobg})`,
            }}
        >
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-[4.5rem] w-auto"
                    />
                </div>
                <div className="flex items-center gap-3">
                   
                <button className='bg-[#BD76F6] rounded w-24 text-white font-sans p-1' onClick={handleSubmit} >Logout</button>
                  
               </div>
                           
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
                {/* Left Section with Text */}
                <div className=" w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 md:pr-8 lg:pr-16">
                    <h2 className="font-unbounded text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 text-gray-800 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        DESTINATION ARRIVED
                    </h2>
                    <p className="font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify">
                        We sincerely appreciate your time and effort in completing this evaluation. Your performance and insights are invaluable to us. Please take a moment to review your score below.
                    </p><br />
                    <p className="font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify">
                        Your dedication and hard work are commendable, and we look forward to seeing how you apply your skills and knowledge in the future.
                    </p><br />
                    <p className="font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify">
                        Your dedication and hard work are commendable, and we look forward to seeing how you apply your skills and knowledge in the future.
                    </p><br />

                </div>

                <div className="w-full md:w-1/2 relative flex justify-center items-center h-[400px] sm:h-[450px] md:h-[500px] z-10  mt-1">
                    <img
                        src={Result}
                        alt="Hero"
                        className="max-w-full max-h-full object-contain z-10 relative"
                    />

                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-0 sm:left-4 md:left-0 lg:left-12 xl:left-12 z-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 w-36 sm:w-40 md:w-36 flex items-center space-x-2">
                                <div className="bg-lite rounded-full p-2">
                                    <MdOutlinePlayLesson className="text-white text-base sm:text-xl" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold text-lite ">18+</span>
                                    <p className="text-xs sm:text-sm text-gray-600">Courses</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-1/2 right-0 sm:right-4 md:top-52 md:right-32 lg:right-12 xl:left-96 z-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 w-36 sm:w-40 md:w-40 flex items-center space-x-2">
                                <div className="bg-lite rounded-full p-2">
                                    <FaUsers className="text-white text-base sm:text-xl" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold text-lite">200000</span>
                                    <p className="text-xs sm:text-sm text-gray-600">Students Trained</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-1/4 left-0 sm:left-4 md:left-8 lg:left-12 z-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 w-36 sm:w-40 md:w-48 flex items-center space-x-2">
                                <div className="bg-lite rounded-full p-2">
                                    <LiaCertificateSolid className="text-white text-base sm:text-xl" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold text-lite">10+</span>
                                    <p className="text-xs sm:text-sm text-gray-600">Year's of Experience</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentResult;