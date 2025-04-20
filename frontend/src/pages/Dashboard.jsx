import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import { Users, AlarmClock } from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAlarmHistory, setTotalAlarmHistory] = useState(0); // You can update this later

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/auth-users"
        );
        setTotalUsers(response.data.length);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, Admin</h1>
        </div>

        {/* Stats Section */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {/* Total Users Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition">
              <Users className="w-14 h-14 text-blue-500 mb-4" />
              <p className="text-gray-600 font-medium text-lg">Total Users</p>
              <h2 className="text-5xl font-bold text-blue-600 mt-2">
                {totalUsers}
              </h2>
            </div>

            {/* Total Alarm History Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition">
              <AlarmClock className="w-14 h-14 text-red-400 mb-4" />
              <p className="text-gray-600 font-medium text-lg">
                Total Alarm History
              </p>
              <h2 className="text-5xl font-bold text-red-500 mt-2">
                {totalAlarmHistory}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
