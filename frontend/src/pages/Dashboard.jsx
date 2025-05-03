import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/Sidebar";
import { Users, AlarmClock, Bell, CheckCircle } from "lucide-react";
import axios from "axios";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAlarmHistory, setTotalAlarmHistory] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const audioRef = useRef(null);

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

    // Prepare audio
    audioRef.current = new Audio("/Notification.mp3");

    // Firebase listener for alarms
    const alarmRef = collection(db, "alarmSounds");
    const unsubscribe = onSnapshot(alarmRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const docData = change.doc.data();
        const userEmail = docData.email;
        const history = docData.alarmHistory || [];

        if (
          (change.type === "added" || change.type === "modified") &&
          history.length > 0
        ) {
          const lastAlarmTime = new Date(history[history.length - 1].time);
          const now = new Date();

          // Notify if recent update (within 5 seconds)
          if (now - lastAlarmTime < 5000) {
            const message = `Alarm triggered for ${userEmail} at ${lastAlarmTime.toLocaleString()}`;

            // Play sound
            audioRef.current?.play();

            // Add to notification list
            setNotificationList((prev) => [
              ...prev,
              { message, timestamp: new Date(), userEmail },
            ]);

            // Trigger browser notification
            if (Notification.permission === "granted") {
              new Notification("Alarm Alert", {
                body: message,
                icon: "/favicon.ico",
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, Admin
          </h1>

          {/* Notification Button */}
          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 bg-opacity-90 bg-gray-900 shadow-lg hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out ml-auto"
          >
            <Bell className="w-5 h-5" /> Notifications (
            {notificationList.length})
          </button>
        </div>

        {/* Notification Dropdown */}
        {isNotificationsOpen && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-80 max-h-96 overflow-y-auto z-50 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              {notificationList.length > 0 ? (
                notificationList.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition duration-300 ease-in-out"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        {notification.message}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No new notifications</p>
              )}
            </div>
          </div>
        )}

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
