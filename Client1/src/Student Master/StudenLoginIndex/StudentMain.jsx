import React from 'react';
import logo from '../../Asserts/Image/logo.png';

import MainRight from '../../Asserts/Image/StudentMainRightImage.png';
import { useNavigate } from 'react-router-dom';



const StudentMain = () => {
    const navigate = useNavigate()

    const handleSubmit = () =>{
        sessionStorage.removeItem("userData");
        navigate('/login');
    }
    return (
        <div className="min-h-screen bg-cover bg-center flex flex-col">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
               <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-[4.5rem] w-auto"/>
                    
                </div>
                <div className="flex items-center gap-3">
                   
                    <button className='bg-[#BD76F6] rounded w-24 text-white font-sans p-1' onClick={handleSubmit} >Logout</button>
                   
                </div>
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
                <div className="w-full md:w-1/2 text-center md:text-left  md:mb-0 md:pr-8 lg:pr-16">
                    <h2 className="font-unbounded text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 text-gray-800">
                        Get Ready for the <br />
                        <span class="font-bounded text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ">
                            Challenge!
                        </span>
                    </h2>
                    <p className="font-sans text-sm sm:text-base md:text-md  text-slate-600 tracking-wider leading-relaxed">
                    Welcome to the NAVIGATOR's Technical Assessment
                    </p><br/>
                    <p className=" font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify">
                    We're delighted to have you here for your evaluation. The moment to showcase your expertise and demonstrate the skills you've cultivated. This assessment is designed to understand not just your technical knowledge but your unique problem-solving approach and analytical mindset.
                    </p><br/>
                    <p className=" font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify">
                    Take your time to consider each challenge carefully. Remember, we value your methodical thinking and attention to detail just as much as your solutions. You've prepared for this moment, and we're excited to see your capabilities in action.
                    </p><br/>
                   
                    <p className="font-sans text-sm sm:text-base md:text-md text-slate-600 tracking-wider leading-relaxed text-justify ">
                    Trust your expertise and show us what makes you exceptional. Good luck!
                    </p><br/>
                  
                </div>

                <div className="">
                    <img
                        src={MainRight}
                        alt="HeroImage"
                        className="w-[600px] h-[600px] z-10 relative"
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentMain;