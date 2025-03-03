import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminDashboardSideBar from './AdminDashboardSideBar';
import AdminDashboard from "./AdminDashboard"


const AdminDashboardIndex = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="fixed min-h-screen flex">

      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden md:hidden fixed top-32 z-50 p-1 rounded  bg-gray-800 text-white hover:shadow-lg hover:scale-105 transition-all duration-200
          ${isSidebarOpen ? "left-60" : "left-2"}`}
      >
         {isSidebarOpen ? <X size={20} /> : <Menu size={20} className='' />}
      </button>

      <div className={` 
        fixed top-28 left-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0 ' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-auto
      `}>
        <div className="">
          <AdminDashboardSideBar />
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0  z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={` 
        flex-1 transition-all duration-300 ease-in-out 
        ${isSidebarOpen ? 'ml-0' : 'ml-0'}
        md:ml-64
      `}>
        <div className="h-screen overflow-y-auto">
          <AdminDashboard/>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardIndex;
