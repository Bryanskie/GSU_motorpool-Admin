// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; // Your firebase initialization
import { useAuth } from "../context/AuthContext";

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
          const alarm = alarmDoc.data();
          const userId = alarmDoc.id; // assuming the doc id is the userId

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

          return {
            userId,
            email: userEmail,
            name: userName,
            alarmDetails: alarm,
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

  if (loading) {
    return <div className="p-4">Loading alarm data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-lg mb-4">Welcome, {user?.email}</h2>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">User ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Alarm Details</th>
          </tr>
        </thead>
        <tbody>
          {alarmData.map((item) => (
            <tr key={item.userId} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.userId}</td>
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b">{item.email}</td>
              <td className="py-2 px-4 border-b">
                <pre className="text-xs">{JSON.stringify(item.alarmDetails, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
