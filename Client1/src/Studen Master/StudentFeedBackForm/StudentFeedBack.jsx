import React from 'react';
import herobg from '../../Asserts/Image/whiteblurbg.png';
import logo from '../../Asserts/Image/logo.png';
import xploretext from '../../Asserts/Image/xploretext.png';
import FeedBack from '../../Asserts/Image/StudentFeedbackFormIndex.png';
import {  FaUsers } from 'react-icons/fa6';
import { LiaCertificateSolid } from 'react-icons/lia';
import { MdOutlinePlayLesson } from 'react-icons/md';

const StudentFeedBack = () => {
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
                        className="h-8 sm:h-10 md:h-12 w-auto" 
                    />

                </div>
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
                <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 md:pr-8 lg:pr-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 text-gray-800">
                        Xplore IT Corp
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 tracking-wider leading-relaxed">
                        Lorem ipsum dolor sit amet consectetur. Sit libero non ut fermentum nulla egestas. Non vitae
                        varius dui velit ut. Adipiscing ultricies ultrices ultricies egestas lectus blandit. Nulla massa
                        ut tellus donec viverra turpis vestibulum enim.
                    </p>
                </div>

                <div className="w-full md:w-1/2 relative flex justify-center items-center h-[400px] sm:h-[450px] md:h-[500px] z-10  mt-1">
                    <img 
                        src={FeedBack} 
                        alt="Hero Image" 
                        className="max-w-full max-h-full object-contain z-10 relative" 
                    />

                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-0 sm:left-4 md:left-0 lg:left-12 xl:left-12 z-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 w-36 sm:w-40 md:w-36 flex items-center space-x-2">
                                <div className="bg-lite rounded-full p-2">
                                    <MdOutlinePlayLesson className="text-white text-base sm:text-xl" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold text-lite ">XX+</span>
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
                                    <span className="text-lg sm:text-xl font-bold text-lite">XXX+</span>
                                    <p className="text-xs sm:text-sm text-gray-600">Students Placed</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-1/4 left-0 sm:left-4 md:left-8 lg:left-12 z-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 w-36 sm:w-40 md:w-48 flex items-center space-x-2">
                                <div className="bg-lite rounded-full p-2">
                                    <LiaCertificateSolid className="text-white text-base sm:text-xl" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold text-lite">XXX+</span>
                                    <p className="text-xs sm:text-sm text-gray-600">Certificates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentFeedBack;