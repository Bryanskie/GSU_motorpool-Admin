import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, FileText, LogOut, Archive } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
        Swal.fire(
          "Logged Out",
          "You have been successfully logged out.",
          "success"
        );
      }
    });
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-5 flex flex-col min-h-screen">
      <h2 className="text-xl font-bold mb-5 text-white">GSU Motorpool</h2>
      <ul className="space-y-4 flex-1">
        <li>
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/dashboard")
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
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
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
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
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
            }`}
          >
            <FileText size={20} /> Reports
          </Link>
        </li>

        <li>
          <Link
            to="/archived-users"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/addAdmin")
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
            }`}
          >
            <Archive size={20} /> Archived Users
          </Link>
        </li>

        <li>
          <Link
            to="/add-admin"
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
              isActive("/addAdmin")
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
            }`}
          >
            <Users size={20} /> Add Admin
          </Link>
        </li>
        <li>
          <div
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:bg-white hover:text-black cursor-pointer transition-colors duration-200 p-2 rounded-lg"
          >
            <LogOut size={20} /> Log Out
          </div>
        </li>
      </ul>
      <div className="text-sm text-white mt-auto">© 2023 Admin Dashboard</div>
    </div>
  );
};

export default Sidebar;
