import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import StudentNavBar from '../studentNavBar/StudentNavBar';
import StudentQuizSideBar from './StudentQuizSideBar';
import StudentQuiz from './StudentQuiz';
import StudentQuizModules from './StudentQuizModules';

const StudentProfileIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, topicId } = useParams();
 
  const isModuleView = location.pathname.split('/').length === 5;

  const handleNavigateToModule = (quizId) => {
    if (quizId) {
      navigate(`/python-programming/quiz/${topicId}/${quizId}`);
    }
  };

  const handleNavigateToQuiz = (topicId) => {
    navigate(`/python-programming/quiz/${topicId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 w-full z-50">
        <StudentNavBar />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[20%_80%] lg:grid-cols-[27%_73%] md:grid-cols-[35%_75%] pt-24 ">
        <div className="bg-white">
          <StudentQuizSideBar 
            onQuizSelect={handleNavigateToQuiz}
            onModuleSelect={handleNavigateToModule}
          />
        </div>
        <div className="">
          {!isModuleView ? (
            <StudentQuiz onModuleSelect={handleNavigateToModule} />
          ) : (
            <StudentQuizModules />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileIndex;