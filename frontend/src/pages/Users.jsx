// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchAlarmData = async () => {
      const alarmSnapshot = await getDocs(collection(db, "alarmSounds"));
      const selectedUserAlarms = alarmSnapshot.docs
        .filter(doc => doc.id === selectedUser.id)
        .map(doc => doc.data());

      setAlarmData(selectedUserAlarms);
    };

    fetchAlarmData();
  }, [selectedUser]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Select a user to view details:</h3>
        <ul>
          {users.map(u => (
            <li key={u.id} className="mb-2">
              <button
                onClick={() => setSelectedUser(u)}
                className="text-blue-600 hover:underline"
              >
                {u.email}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div>
          <h3 className="text-xl font-semibold">Alarm Sounds for {selectedUser.email}</h3>
          <pre className="bg-gray-100 p-4">{JSON.stringify(alarmData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Users;
