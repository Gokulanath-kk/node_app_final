import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  HelpCircle,
  LogOut,
  ChevronDown,
  Settings,
  User,
  Bell,
  Trash,
  Layout,
} from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import { FaUserSecret } from 'react-icons/fa6';

const AdminDashboardSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [admin, setAdmin] = useState([]);
  const [role, setRole] = useState([])

  const adminData = JSON.parse(sessionStorage.getItem("Admin") || "{}");
  const adminId = adminData?.id;

  const fetchAdminData = useCallback(async () => {
    if (!adminId) return;

    try {
      const response = await axiosInstance.get(`/admin/adminData/${adminId}`);
      setAdmin(response.data[0]?.name);
      setRole(response.data[0].role)
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  }, [adminId]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const menuItems = [
    { icon: <Layout size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <GraduationCap size={20} />, label: 'Category', path: '/category' },
    { icon: <GraduationCap size={20} />, label: 'Course', path: '/course' },
    { icon: <HelpCircle size={20} />, label: 'Quiz', path: '/quiz' },
    { icon: <Trash size={20} />, label: 'Trash', path: '/trash' },
  ];

  const bottomMenuItems = [
    // {
    //   icon: <HelpCircle size={20} />,
    //   label: 'Help & Support',
    //   path: '/help',
    // },
    {
      icon: <LogOut size={20} />,
      label: 'Sign Out',
      className: 'text-red-600 hover:bg-red-50',
      path: '/',
    },
  ];

  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("Admin");
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const MenuItem = ({ item, onClick }) => (
    <button
      onClick={() => onClick(item.path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        transform hover:translate-x-1 hover:shadow-md
        ${location.pathname === item.path
          ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
          : 'text-gray-600 hover:bg-gray-50'
        } group`}
    >
      <span className={`transition-colors duration-300 
        ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`}
      >
        {item.icon}
      </span>
      <span className="text-sm group-hover:text-indigo-600">{item.label}</span>
    </button>
  );

  return (
    <div className="relative h-screen">
      <aside className="fixed left-0 h-screen bg-white transition-all duration-300 ease-in-out border w-72">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center transform transition-all duration-300 hover:rotate-12">
                <span className="text-white font-bold">X</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Xplore It Corp</span>
            </div>
          </div>

          {/* Profile Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div
              className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-gray-50 transition-all duration-300"
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden ring-2 ring-white shadow-lg flex items-center justify-center">
                  <FaUserSecret size={30} className="text-slate-600" /> 
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{admin || 'Admin'}</h3>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>

            </div>


          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <MenuItem key={index} item={item} onClick={handleNavigation} />
              ))}
            </div>
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-1">
              {bottomMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.label === 'Sign Out' ? handleSignOut() : handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    transform hover:translate-x-1 hover:shadow-md
                    ${item.className || 'text-gray-600 hover:bg-gray-50'} group`}
                >
                  <span className={`transition-colors duration-300 ${item.className?.includes('text-red-600')
                      ? 'text-red-400'
                      : 'text-gray-400 group-hover:text-indigo-600'
                    }`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardSideBar;