import React from 'react';
import logo from '../../Asserts/Image/logo.png';
import xploretext from '../../Asserts/Image/xploretext.png';
import MainRight from '../../Asserts/Image/StudentMainRightImage.png';


const StudentMain = () => {
    return (
        <div className="min-h-screen bg-cover bg-center flex flex-col">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 md:p-8 z-10">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-8 sm:h-10 md:h-12 w-auto"/>
                    {/* <h1 className='font-bankgothic text-center'>XPLORE IT CORP <br/>
                    <span className='font-astron_boy capitalize'>design your desire</span>
                    </h1> */}
                </div>
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
                <div className="w-full md:w-1/2 text-center md:text-left  md:mb-0 md:pr-8 lg:pr-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 text-gray-800">
                        Get Ready for the <br />
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ">
                            Challenge!
                        </span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 tracking-wider leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur. Ullamcorper id adipiscing consectetur euismod bibendum ullamcorper. Sed dignissim nulla ac vestibulum. Suscipit arcu faucibus duis eget velit interdum. Montes vitae suspendisse nibh dictum pretium auctor faucibus urna.
                    </p>
                </div>

                <div className="w-full md:w-1/2 relative flex justify-center items-center h-screen lg-screen sm:h-[450px] md:h-[500px] z-10  mt-1">
                    <img
                        src={MainRight}
                        alt="HeroImage"
                        className="max-w-full max-h-screen object-contain z-10 relative"
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentMain;