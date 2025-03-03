import React, { useState } from 'react'
import logo from "../../Asserts/Image/logo.png"
import StudentQuiz from './StudentQuiz'
import { useNavigate } from 'react-router-dom';
import logout from '../../Asserts/Image/logout btn.svg'

const StudentQuizIndex = () => {
    const [selectedQuizId] = useState(null);
    const [ setCurrentQuizId] = useState(null);

    

    const handleCurrentQuizChange = (quizId) => {
        setCurrentQuizId(quizId);
    };
    const navigate = useNavigate()

    const handleSubmit = () =>{
        sessionStorage.removeItem("userData");
        navigate('/login');
    }
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between    z-10">
                <div className="flex items-center  sm:p-8">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-[4.5rem]"
                    />
                    
                </div>
                <div className="flex items-center gap-3">
                   
                <button className='bg-[#BD76F6] rounded w-24 text-white font-sans p-1 mr-2' onClick={handleSubmit} >Logout</button>
               </div>
            </div>

            <div className="">
              
                <div className="">
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