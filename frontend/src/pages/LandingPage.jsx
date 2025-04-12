import React from "react";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/BUKSU-Brand-Logo.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-10 text-[400px] font-bold text-yellow-500 opacity-10 transform -translate-y-1/2 select-none animate-pulse">
          ⚠️
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-opacity-90 bg-gray-900 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-12 animate-fade-in" />
            <span className="text-xl font-bold text-white tracking-wide">
              GSU Motopol
            </span>
          </div>
          <Link
            to="/login"
            className="flex items-center px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 text-white font-semibold shadow-md hover:shadow-xl transform hover:scale-105"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center text-center px-6 relative">
        <div className="animate-fade-in-up relative z-10">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            AI-Based Drowsiness Detection
          </h1>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
            Monitoring driver alertness in real-time using advanced AI.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-900 text-gray-400">
        <p className="text-sm">&copy; 2025 | AI Drowsiness Detection System</p>
      </footer>
    </div>
  );
};

export default LandingPage;
