import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/Sidebar";
import { Users, AlarmClock, Bell, CheckCircle } from "lucide-react";
import axios from "axios";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import DataTable from "react-data-table-component";

const db = getFirestore(app);

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAlarmHistory, setTotalAlarmHistory] = useState(0);
  const [userAlarmCounts, setUserAlarmCounts] = useState([]);
  const [notificationList, setNotificationList] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const audioRef = useRef(null);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#111827",
        opacity: 1,
        color: "#ffffff",
        fontSize: "15px",
      },
    },
  };

  useEffect(() => {
    const fetchAndMergeData = async () => {
      try {
        const authRes = await axios.get(
          "http://localhost:5000/api/admin/auth-users"
        );
        const authUsers = authRes.data;

        // Filter out admins from total user count too (optional)
        const nonAdminUsers = authUsers.filter((user) => user.role !== "admin");
        setTotalUsers(nonAdminUsers.length);

        const alarmRef = collection(db, "alarmSounds");

        const unsubscribe = onSnapshot(alarmRef, (snapshot) => {
          const alarmDocs = {};
          let totalCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const email = data.email;
            const history = data.alarmHistory || [];
            totalCount += history.length;
            alarmDocs[email] = history.length;

            // Handle recent alarm notifications
            history.forEach((entry) => {
              const entryTime = new Date(entry.time);
              const now = new Date();
              if (now - entryTime < 5000) {
                const message = `Alarm triggered for ${email} at ${entryTime.toLocaleString()}`;
                audioRef.current?.play();
                setNotificationList((prev) => [
                  ...prev,
                  { message, timestamp: new Date(), userEmail: email },
                ]);
                if (Notification.permission === "granted") {
                  new Notification("Alarm Alert", {
                    body: message,
                    icon: "/favicon.ico",
                  });
                }
              }
            });
          });

          // Only include non-admins in table data
          const mergedData = nonAdminUsers.map((user) => ({
            name: user.displayName || "Unknown",
            email: user.email,
            count: alarmDocs[user.email] || 0,
          }));

          setUserAlarmCounts(mergedData);
          setTotalAlarmHistory(totalCount);
        });

        if (Notification.permission !== "granted") {
          Notification.requestPermission();
        }

        return () => unsubscribe();
      } catch (err) {
        console.error("Failed to fetch or merge data:", err);
      }
    };

    audioRef.current = new Audio("/Notification.mp3");
    fetchAndMergeData();
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Total Alarms",
      selector: (row) => row.count,
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, Admin
          </h1>
          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 bg-opacity-90 bg-gray-900 shadow-lg hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out ml-auto"
          >
            <Bell className="w-5 h-5" /> Notifications (
            {notificationList.length})
          </button>
        </div>

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

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-center items-center text-center hover:shadow-lg transition">
              <Users className="w-14 h-14 text-blue-500 mb-4" />
              <p className="text-gray-600 font-medium text-lg">Total Users</p>
              <h2 className="text-5xl font-bold text-blue-600 mt-2">
                {totalUsers}
              </h2>
            </div>

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

          <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Alarm History Per User
            </h3>
            <DataTable
              columns={columns}
              data={userAlarmCounts}
              pagination
              striped
              highlightOnHover
              responsive
              noDataComponent="No alarm history found for any users."
              customStyles={customStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
