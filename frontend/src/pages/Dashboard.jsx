import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../component/Sidebar";
import { Users, AlarmClock } from "lucide-react";
import axios from "axios";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const db = getFirestore(app);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAlarmHistory, setTotalAlarmHistory] = useState(0);

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

    if (!user) {
      // No authenticated user (admin), stop fetching
      return;
    }

    // Fetch all alarm history without filtering by user
    const alarmRef = collection(db, "alarmSounds");

    const unsubscribe = onSnapshot(alarmRef, (snapshot) => {
      let totalHistoryCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const history = data.alarmHistory || [];
        totalHistoryCount += history.length;
      });

      setTotalAlarmHistory(totalHistoryCount);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, Admin
          </h1>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition">
              <Users className="w-14 h-14 text-blue-500 mb-4" />
              <p className="text-gray-600 font-medium text-lg">Total Users</p>
              <h2 className="text-5xl font-bold text-blue-600 mt-2">
                {totalUsers}
              </h2>
            </div>

            {/* Total Alarm History */}
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
