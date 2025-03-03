import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthRoute  from './AuthRoute'
import AdminDashboardIndex from './Admin Master/AdminDashboard/AdminDashboardIndex';
import AdminCourseIndex from './Admin Master/AdminCourse/AdminCourseIndex';
import AdminQuizIndex from './Admin Master/AdminQuiz/AdminQuizIndex';
import StudentHeroIndex from './Student Master/StudenLanding/StudentHeroIndex';
import StudentLoginIndex from './Student Master/StudentLogin/StudentLoginIndex';
import StudentMainIndex from './Student Master/StudenLoginIndex/StudentMainIndex';
import StudentQuizIndex from './Student Master/StudentQuiz/StudentQuizIndex';
import StudentResultIndex from './Student Master/StudentResultIndex/StudentResultIndex';
import StudentFeedBackIndex from './Student Master/StudentFeedBackForm/StudentFeedBackIndex';
import StudentQuizResultIndex from './Student Master/StudentQuizResult/StudentQuizResultIndex';
import AdminLoginIndex from './Admin Master/AdminLogin/AdminLoginIndex';
import NotFound from './NotFound';
import AdminCatagoryIndex from './Admin Master/AdminCatagory/AdminCatagoryIndex';
import AdminTrashIndex from './Admin Master/AdminTrash/AdminTrashIndex';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentHeroIndex />} />
          <Route path="/admin" element={<AuthRoute><AdminDashboardIndex /></AuthRoute>} />
          <Route path="/dashboard" element={<AuthRoute><AdminDashboardIndex />  </AuthRoute>} />
          <Route path="/category" element={<AuthRoute><AdminCatagoryIndex /></AuthRoute>}  />
          <Route path="/course" element={<AuthRoute><AdminCourseIndex /> </AuthRoute>} />
          <Route path="/quiz" element={<AuthRoute><AdminQuizIndex />  </AuthRoute>} />
          <Route path="/trash" element={<AuthRoute><AdminTrashIndex/>  </AuthRoute>} />
          <Route path="/logout" element={<AuthRoute><AdminLoginIndex /> </AuthRoute>} />

          <Route path="*" element={<NotFound />} />
          <Route path="/adminlogin" element={<AdminLoginIndex />} />
          <Route path="/login" element={<StudentLoginIndex />} />
          <Route path="/landingIndex" element={<StudentMainIndex />} />
          <Route path="/:coursename/quiz" element={<StudentQuizIndex />} />
          <Route path="/:coursename/student-result" element={<StudentResultIndex />} />
          <Route path="/feedbackform" element={<StudentFeedBackIndex />} />
          <Route path="/:coursename/viewquiz-results" element={<StudentQuizResultIndex />} />
        </Routes>

      </BrowserRouter>
    </>
  );
};

export default App;
