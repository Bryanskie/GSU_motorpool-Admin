import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import Swal from "sweetalert2";
import { Bell, CheckCircle } from "lucide-react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const AddAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Notification states
  const [notificationList, setNotificationList] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const audioRef = useRef(null);

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add-admin",
        { email, password, displayName }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
        confirmButtonColor: "#3085d6",
      });

      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Something went wrong.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  useEffect(() => {
    audioRef.current = new Audio("/Notification.mp3");

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

          if (now - lastAlarmTime < 5000) {
            const message = `Alarm triggered for ${userEmail} at ${lastAlarmTime.toLocaleString()}`;

            audioRef.current?.play();

            setNotificationList((prev) => [
              ...prev,
              { message, timestamp: new Date(), userEmail },
            ]);

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

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200 relative">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Add New Admin</h1>

          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 bg-opacity-90 bg-gray-900 shadow-lg hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out ml-auto"
          >
            <Bell className="w-5 h-5" />
            Notifications ({notificationList.length})
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
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
