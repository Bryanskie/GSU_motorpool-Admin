// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileText, LogOut } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-black shadow-lg p-5 flex flex-col min-h-screen">
      <h2 className="text-xl font-bold mb-5 text-white">Admin Dashboard</h2>
      <ul className="space-y-4 flex-1">
        <li>
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/dashboard")
                ? "bg-gray-800 text-blue-400"
                : "text-white hover:bg-gray-800 hover:text-blue-400"
            }`}
          >
            <Home size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/users"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/users")
                ? "bg-gray-800 text-blue-400"
                : "text-white hover:bg-gray-800 hover:text-blue-400"
            }`}
          >
            <Users size={20} /> Users
          </Link>
        </li>
        <li>
          <Link
            to="/reports"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/reports")
                ? "bg-gray-800 text-blue-400"
                : "text-white hover:bg-gray-800 hover:text-blue-400"
            }`}
          >
            <FileText size={20} /> Reports
          </Link>
        </li>
        <li>
          <div className="flex items-center gap-2 text-white hover:bg-gray-800 hover:text-blue-400 cursor-pointer transition-colors duration-200 p-2 rounded-lg">
            <LogOut size={20} /> Log Out
          </div>
        </li>
      </ul>
      <div className="text-sm text-white mt-auto">© 2023 Admin Dashboard</div>
    </div>
  );
};

export default Sidebar;
