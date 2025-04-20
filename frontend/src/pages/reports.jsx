import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import { X, Search } from "lucide-react";
import Sidebar from "../component/Sidebar";

// Initialize Firestore
const db = getFirestore(app);

function UserReport() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredUsers = users.filter((user) => {
    const name = user.displayName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

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
          setAlarmData([]);
        }
      });
      return unsubscribe;
    };

    const unsubscribe = fetchAlarmHistory();
    return () => unsubscribe();
  }, [selectedUser]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800">User Report</h1>
        </div>

        <div className="p-6 flex-1">
          {/* Search Input with Icon */}
          <div className="mb-6 relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User Table */}
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-blue-100 text-left text-sm font-semibold text-gray-600">
                <tr>
                  <th className="py-3 px-5">User ID</th>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition">
                      <td className="py-2 px-5">{u.uid}</td>
                      <td className="py-2 px-5">{u.displayName || "-"}</td>
                      <td className="py-2 px-5">{u.email}</td>
                      <td className="py-2 px-5 text-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                        >
                          View Alarm History
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found.
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
              <div className="h-[70vh] overflow-y-auto">
                <table className="min-w-full text-sm text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
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
