import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminDashboardSideBar from '../AdminDashboard/AdminDashboardSideBar';
import AdminCourse from './AdminCourse';
import Slate from '../AdminDashboard/Slate';



const AdminCourseIndex = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-[20%_80%] md:grid-cols-[38%_62%]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white  md:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={` 
          fixed top-0 left-0 h-full w-64 bg-white  transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:w-auto
        `}>
        <div className="h-full">
          <AdminDashboardSideBar />
        </div>
      </div>


      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto overflow-hidden  scrollbar-hide">
        <Slate />
        <AdminCourse />
      </div>
    </div>
  );
};

export default AdminCourseIndex;
