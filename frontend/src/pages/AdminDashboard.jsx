// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../component/Sidebar";

const db = getFirestore(app);

function AdminDashboard() {
  const { user } = useAuth();
  const [alarmData, setAlarmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlarmData = async () => {
      try {
        const alarmSnapshot = await getDocs(collection(db, "alarmSounds"));

        const alarmPromises = alarmSnapshot.docs.map(async (alarmDoc) => {
          const userId = alarmDoc.id;
          const alarmDetails = alarmDoc.data(); // assume contains multiple alarms or timestamps

          let userEmail = "-";
          let userName = "-";

          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userEmail = userData.email || "-";
              userName = userData.name || "-";
            }
          } catch (userErr) {
            console.error(`Failed to fetch user for alarm ${userId}:`, userErr);
          }

          // Flatten nested alarm entries if needed
          const alarmsArray = Object.entries(alarmDetails).map(
            ([timestamp, value]) => ({
              timestamp,
              ...value,
            })
          );

          return {
            userId,
            email: userEmail,
            name: userName,
            alarms: alarmsArray,
          };
        });

        const alarmsWithUsers = await Promise.all(alarmPromises);
        setAlarmData(alarmsWithUsers);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch alarm sounds:", err);
        setError("Failed to load alarm data.");
        setLoading(false);
      }
    };

    fetchAlarmData();
  }, []);

  if (loading) return <div className="p-4">Loading alarm data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <h2 className="text-md text-gray-600 mb-4">Welcome, {user?.email}</h2>

        {alarmData.length === 0 ? (
          <p>No alarm data found.</p>
        ) : (
          <div className="space-y-6">
            {alarmData.map((entry) => (
              <div
                key={entry.userId}
                className="bg-white shadow-md p-4 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {entry.name} ({entry.email})
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  User ID: {entry.userId}
                </p>

                <table className="w-full table-auto text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Timestamp</th>
                      <th className="border px-4 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.alarms.map((alarm, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{alarm.timestamp}</td>
                        <td className="border px-4 py-2 whitespace-pre-wrap">
                          {Object.entries(alarm)
                            .filter(([key]) => key !== "timestamp")
                            .map(([key, val]) => `${key}: ${val}`)
                            .join("\n")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
