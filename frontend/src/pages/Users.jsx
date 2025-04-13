import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { X, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../component/Sidebar";
import Swal from "sweetalert2";

const db = getFirestore(app);

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);

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

  const handleUpdate = (user) => {
    setSelectedUser(user);
  };

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/user/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        Swal.fire("Deleted!", "User has been deleted.", "success");
        fetchAuthUsers();
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error!", "Failed to delete user: " + error.message, "error");
      }
    }
  };

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchAlarmData = async () => {
      try {
        const alarmSnapshot = await getDocs(collection(db, "alarmSounds"));
        const selectedUserAlarms = alarmSnapshot.docs
          .filter((doc) => doc.id === selectedUser.uid)
          .map((doc) => doc.data());

        setAlarmData(selectedUserAlarms);
      } catch (err) {
        console.error("Failed to fetch alarm data:", err);
      }
    };

    fetchAlarmData();
  }, [selectedUser]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Registered Users</h1>
        </div>

        <div className="p-6 flex-1">
          <div className="bg-white p-5 shadow-md rounded-lg mb-6">
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
                    <tr key={u.uid} className="hover:bg-gray-50">
                      <td className="py-2 px-5 border-b">{u.uid}</td>
                      <td className="py-2 px-5 border-b">
                        {u.displayName || "-"}
                      </td>
                      <td className="py-2 px-5 border-b">{u.email}</td>
                      <td className="py-2 px-5 border-b text-center space-x-2">
                        <button
                          onClick={() => handleUpdate(u)}
                          className="inline-flex items-center gap-1 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(u.uid)}
                          className="inline-flex items-center gap-1 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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

        {selectedUser && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg p-6 w-[30rem] shadow-2xl border border-gray-300 relative pointer-events-auto">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              >
                <X />
              </button>

              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Update User Details
              </h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/admin/user/${selectedUser.uid}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                        body: JSON.stringify({
                          displayName: selectedUser.displayName,
                          email: selectedUser.email,
                        }),
                      }
                    );

                    if (!res.ok) {
                      throw new Error("Failed to update user");
                    }

                    Swal.fire(
                      "Success!",
                      "User updated successfully",
                      "success"
                    );
                    setSelectedUser(null);
                    fetchAuthUsers(); // Refresh list
                  } catch (error) {
                    console.error("Update error:", error);
                    Swal.fire("Error", "Could not update user.", "error");
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={selectedUser.displayName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
