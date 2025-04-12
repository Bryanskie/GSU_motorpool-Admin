// src/pages/Dashboard.jsx
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useLocation } from "react-router-dom";
import Sidebar from "../component/Sidebar";

const Dashboard = () => {
  const location = useLocation();

  const drowsyData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 30 },
    { name: "Mar", value: 20 },
    { name: "Apr", value: 27 },
    { name: "May", value: 18 },
    { name: "Jun", value: 23 },
    { name: "Jul", value: 35 },
    { name: "Aug", value: 25 },
    { name: "Sep", value: 28 },
    { name: "Oct", value: 32 },
    { name: "Nov", value: 19 },
    { name: "Dec", value: 22 },
  ];

  const yawnData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 15 },
    { name: "Mar", value: 8 },
    { name: "Apr", value: 12 },
    { name: "May", value: 5 },
    { name: "Jun", value: 7 },
    { name: "Jul", value: 14 },
    { name: "Aug", value: 9 },
    { name: "Sep", value: 11 },
    { name: "Oct", value: 13 },
    { name: "Nov", value: 6 },
    { name: "Dec", value: 8 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Navbar */}
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, Admin</h1>
        </div>

        {/* Stats Cards */}
        <div className="p-6 flex-1">
          {/* Total Users Card */}
          <div className="bg-white p-5 shadow-md rounded-lg mb-6">
            <h3 className="text-lg font-bold text-gray-700">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-900">1,230</p>
          </div>

          {/* Graphs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drowsy Detected Graph */}
            <div className="bg-white p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Drowsy Detected
              </h3>
              <RechartsBarChart width={400} height={300} data={drowsyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2563EB" />
              </RechartsBarChart>
            </div>

            {/* Yawn Detected Graph */}
            <div className="bg-white p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Yawn Detected
              </h3>
              <RechartsBarChart width={400} height={300} data={yawnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#EF4444" />
              </RechartsBarChart>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white p-6 shadow-md rounded-lg mx-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
