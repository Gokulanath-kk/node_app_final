import React, { useCallback, useEffect, useState } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const FeedBackForm = () => {

    const navigate = useNavigate()

    const [course , setCourse] = useState([])
    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const course_id = userData[0]?.course_id || '';


    const fetchCourse = useCallback(async () => {
        axiosInstance.get(`/courses/viewCourse/${course_id}`).then((res) => {
            setCourse(res.data.course_name)
        }).catch((err) => {
            console.error(err , "Error"); 
        })
    }, [course_id]);

    useEffect(() => {
        fetchCourse()
    },[fetchCourse])

    const handlenavigate = () => {
        if(course) {
            navigate(`/feedbackform`)
        }
    }

    return (
        <div className='bg-purple-200 p-10 md:p-20'>
            <div className='flex justify-center items-center '>
                <h1 className="font-unbounded text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Feedback form
                </h1>
            </div>
            <div className="flex justify-center items-center pt-10">
                <button
                    onClick={handlenavigate}
                    className="text-blue-600 hover:text-blue-800 text-base sm:text-sm md:text-md lg:text-lg xl:text-xl"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    https://feedbackform.xicsolutions.in
                </button>
            </div>


            <div className='flex justify-center items-center pt-10'>
                <h1 className="font-unbounded text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Follow us
                </h1>
            </div >
            <div className="flex flex-wrap justify-center space-x-4 pt-10">
                <div className='flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-pink-600 p-2 rounded-lg mb-4'>
                    <a
                        href="https://www.facebook.com/xploreitcorp/"
                        className="text-white hover:text-gray-300"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaFacebookF size={20} />
                    </a>
                </div>
                <div className='flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-pink-600 p-2 rounded-lg mb-4'>
                    <a
                        href="https://www.youtube.com/channel/UCNJ3ksuUFYspWgFewet_6wQ"
                        className="text-white hover:text-gray-300"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaYoutube size={20} />
                    </a>
                </div>
                <div className='flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-pink-600 p-2 rounded-lg mb-4'>
                    <a
                        href="https://twitter.com/xiccbe"
                        className="text-white hover:text-gray-300"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaTwitter size={20} />
                    </a>
                </div>
                <div className='flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-pink-600 p-2 rounded-lg mb-4'>
                    <a
                        href="https://in.linkedin.com/company/xic-ltd"
                        className="text-white hover:text-gray-300"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaLinkedinIn size={20} />
                    </a>
                </div>
                <div className='flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-pink-600 p-2 rounded-lg mb-4'>
                    <a
                        href="https://www.instagram.com/xploreitcorp/"
                        className="text-white hover:text-gray-300"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaInstagram size={20} />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default FeedBackForm
