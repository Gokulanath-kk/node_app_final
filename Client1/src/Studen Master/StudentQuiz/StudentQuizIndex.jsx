import React, { useState, useEffect } from 'react'
import logo from "../../Asserts/Image/logo.png"
import xploretext from "../../Asserts/Image/xploretext.png"
import QuizSideBar from './QuizSideBar'
import StudentQuiz from './StudentQuiz'

const StudentQuizIndex = () => {
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [currentQuizId, setCurrentQuizId] = useState(null);

    const handleQuizSelect = (quizId) => {
        setSelectedQuizId(quizId);
    };

    const handleCurrentQuizChange = (quizId) => {
        setCurrentQuizId(quizId);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-8 sm:h-10 md:h-12 w-auto"
                    />
                    <h1 className='font-bankgothic text-center'>XPLORE IT CORP <br/>
                    <span className='font-astron_boy capitalize'>design your desire</span>
                    </h1>
                </div>
            </div>

            <div className="">
                {/* <div className="">
                    <QuizSideBar 
                        onQuizSelect={handleQuizSelect} 
                        currentQuizId={currentQuizId} 
                    />
                </div> */}
                <div className="-mt-10">
                    <StudentQuiz 
                        selectedQuizId={selectedQuizId} 
                        onCurrentQuizChange={handleCurrentQuizChange} 
                    />
                </div>
            </div>
        </div>
    )
}

export default StudentQuizIndex;