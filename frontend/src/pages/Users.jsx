import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import {
  X,
  Pencil,
  Trash2,
  Search,
  Bell,
  CheckCircle,
  Archive,
} from "lucide-react";
import Sidebar from "../component/Sidebar";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const db = getFirestore(app);

const columns = (handleUpdate, handleDisable) => [
  {
    name: "Name",
    selector: (row) => row.displayName || "-",
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
  },
  {
    name: "Role",
    selector: (row) => row.role,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="space-x-2">
        <button
          onClick={() => handleUpdate(row)}
          className="inline-flex items-center gap-1 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDisable(row.uid)}
          className="inline-flex items-center gap-1 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition"
        >
          <Archive className="w-4 h-4" />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationList, setNotificationList] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const audioRef = useRef(null);

  const fetchAuthUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth-users"
      );
      const data = await response.json();
      if (Array.isArray(data)) setUsers(data);
      else console.error("Expected array, got:", data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleUpdate = (user) => setSelectedUser({ ...user });

  const handleDisable = async (userId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You want to disable this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/user/${userId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to disable the user");
        }

        Swal.fire("Disabled!", "User has been disabled.", "success");
        fetchAuthUsers();
      } catch (error) {
        console.error("Error:", error);
        Swal.fire(
          "Error!",
          `Failed to disable the user: ${error.message}`,
          "error"
        );
      }
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  useEffect(() => {
    fetchAuthUsers();

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

  useEffect(() => {
    document.body.style.overflow = selectedUser ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedUser]);

  const filteredUsers = users.filter((user) => {
    const name = user.displayName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Registered Users
          </h1>
          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 bg-opacity-90 bg-gray-900 text-white px-4 py-2 rounded-lg"
          >
            <Bell className="w-5 h-5" />
            Notifications ({notificationList.length})
          </button>
        </div>

        {/* Notifications Panel */}
        {isNotificationsOpen && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-80 max-h-96 overflow-y-auto z-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              {notificationList.length > 0 ? (
                notificationList.map((n, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{n.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No new notifications</p>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="p-6">
          <DataTable
            columns={columns(handleUpdate, handleDisable)}
            data={filteredUsers}
            pagination
            highlightOnHover
            pointerOnHover
            responsive
            striped
            subHeader
            subHeaderComponent={
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border rounded shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            }
          />
        </div>

        {/* Update Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
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

                    if (!res.ok) throw new Error("Failed to update user");

                    Swal.fire(
                      "Success!",
                      "User updated successfully",
                      "success"
                    );
                    setSelectedUser(null);
                    fetchAuthUsers();
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
                    className="w-full px-4 py-2 border rounded"
                    value={selectedUser.displayName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        displayName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
