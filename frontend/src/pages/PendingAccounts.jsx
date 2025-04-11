// src/pages/PendingAccounts.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { app } from "../firebase"; // Firebase app initialization

const db = getFirestore(app);

function PendingAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pendingAccounts"));
        const accountsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(accountsList);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };

    fetchAccounts();
  }, []);

  const approveAccount = async (id) => {
    try {
      const accountDoc = doc(db, "pendingAccounts", id);
      await updateDoc(accountDoc, { status: "approved" });
      setAccounts(accounts.filter(acc => acc.id !== id)); // Remove from list
    } catch (err) {
      console.error("Failed to approve account:", err);
    }
  };

  const deleteAccount = async (id) => {
    try {
      const accountDoc = doc(db, "pendingAccounts", id);
      await deleteDoc(accountDoc);
      setAccounts(accounts.filter(acc => acc.id !== id)); // Remove from list
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  if (loading) return <div>Loading accounts...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pending Accounts</h1>
      <ul>
        {accounts.map(acc => (
          <li key={acc.id} className="flex justify-between mb-2 p-2 bg-gray-100">
            <div>
              <div>Email: {acc.email}</div>
              <div>Status: {acc.status}</div>
            </div>
            <div>
              <button
                className="bg-green-500 text-white px-4 py-2 mr-2"
                onClick={() => approveAccount(acc.id)}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2"
                onClick={() => deleteAccount(acc.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PendingAccounts;
