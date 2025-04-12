import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase"; // Ensure you import your Firebase config
import { X } from "lucide-react";
import Sidebar from "../component/Sidebar";

// Initialize Firestore
const db = getFirestore(app);

function UserReport() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);

  // Fetch users data
  const fetchAuthUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth-users"
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Expected array, got:", data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  // Fetch alarm data based on selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchAlarmHistory = () => {
      const alarmRef = collection(db, "alarmSounds");
      const userAlarmQuery = query(
        alarmRef,
        where("email", "==", selectedUser.email)
      );
      const unsubscribe = onSnapshot(userAlarmQuery, (snapshot) => {
        if (!snapshot.empty) {
          const alarmsData = snapshot.docs.map((doc) => doc.data());
          setAlarmData(alarmsData);
        } else {
          setAlarmData([]); // Clear alarm data if no data is found
        }
      });
      return unsubscribe;
    };

    // Fetch alarm history when selectedUser changes
    const unsubscribe = fetchAlarmHistory();
    return () => unsubscribe(); // Cleanup on unmount or when selectedUser changes
  }, [selectedUser]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800">User Report</h1>
        </div>

        {/* Main content */}
        <div className="p-6 flex-1">
          {/* User Table */}
          <div className="bg-white p-5 shadow-md rounded-lg mb-6 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="py-3 px-5 border-b text-start">User ID</th>
                  <th className="py-3 px-5 border-b text-start">Name</th>
                  <th className="py-3 px-5 border-b text-start">Email</th>
                  <th className="py-3 px-5 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition">
                      <td className="py-2 px-5 border-b">{u.uid}</td>
                      <td className="py-2 px-5 border-b">
                        {u.displayName || "-"}
                      </td>
                      <td className="py-2 px-5 border-b">{u.email}</td>
                      <td className="py-2 px-5 border-b text-center">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 transition"
                        >
                          View Alarm History
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No users found or failed to fetch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Alarm History */}
        {selectedUser && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl border border-gray-300 relative pointer-events-auto max-h-[80vh] overflow-hidden">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              >
                <X />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Alarm History for {selectedUser.email}
              </h2>
              {/* Scrollable Table */}
              <div className="h-[70vh] overflow-y-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600">
                      <th className="py-3 px-4 border-b text-left">#</th>
                      <th className="py-3 px-4 border-b text-center">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alarmData.length > 0 ? (
                      alarmData.map((alarm, alarmIndex) =>
                        alarm.alarmHistory.length > 0 ? (
                          alarm.alarmHistory.map((history, index) => (
                            <tr
                              key={`${alarmIndex}-${index}`}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="py-3 px-4 border-b text-center text-sm font-medium">
                                {alarmIndex * 10 + index + 1}
                              </td>
                              <td className="py-3 px-4 border-b text-center text-sm font-medium">
                                {new Date(history.time).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr key={alarmIndex}>
                            <td
                              colSpan="2"
                              className="text-center py-3 px-4 text-gray-500"
                            >
                              No Alarm History
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="text-center py-3 px-4 text-gray-500"
                        >
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserReport;
