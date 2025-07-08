import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import { X, Search, Bell, CheckCircle, Printer } from "lucide-react";
import Sidebar from "../component/Sidebar";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DataTable from "react-data-table-component";

const db = getFirestore(app);

const columns = [
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
      <button
        onClick={() => {
          setSelectedUser(row);
          toggleModal();
        }}
        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
      >
        Alarm History
      </button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

function UserReport() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alarmData, setAlarmData] = useState([]);
  const [filteredAlarmData, setFilteredAlarmData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationList, setNotificationList] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const fetchAuthUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth-users"
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const nonAdminUsers = data.filter((user) => {
          return (
            user.role !== "admin" &&
            user.customClaims?.role !== "admin" &&
            !user.isAdmin
          );
        });

        setUsers(nonAdminUsers);
      } else {
        console.error("Expected array, got:", data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchAuthUsers();
    audioRef.current = new Audio("/Notification.mp3");
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = user.displayName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  useEffect(() => {
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

    const alarmRef = collection(db, "alarmSounds");
    const userAlarmQuery = query(
      alarmRef,
      where("email", "==", selectedUser.email)
    );
    const unsubscribe = onSnapshot(userAlarmQuery, (snapshot) => {
      if (!snapshot.empty) {
        const newAlarmsData = snapshot.docs.map((doc) => doc.data());
        const userHistory = newAlarmsData
          .map((alarm) => alarm.alarmHistory)
          .flat();
        setAlarmData(userHistory);
        setFilteredAlarmData(userHistory);
      } else {
        setAlarmData([]);
        setFilteredAlarmData([]);
      }
    });
    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredAlarmData(alarmData);
      return;
    }

    const filtered = alarmData.filter((alarm) => {
      const alarmDate = new Date(alarm.time);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return alarmDate >= start && alarmDate <= end;
      } else if (start) {
        return alarmDate >= start;
      } else if (end) {
        return alarmDate <= end;
      }
      return true;
    });

    setFilteredAlarmData(filtered);
  }, [alarmData, startDate, endDate]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setStartDate("");
      setEndDate("");
    }
  };

  const generatePDF = () => {
    if (!selectedUser || filteredAlarmData.length === 0) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Alarm History Report for ${selectedUser.displayName}`, 15, 15);

    // Date range info
    doc.setFontSize(12);
    let dateRangeText = "All time";
    if (startDate || endDate) {
      dateRangeText = `From: ${startDate || "Beginning"} To: ${
        endDate || "Now"
      }`;
    }
    doc.text(`Date Range: ${dateRangeText}`, 15, 25);

    // Table data
    const tableData = filteredAlarmData.map((alarm, index) => [
      index + 1,
      new Date(alarm.time).toLocaleString(),
    ]);

    // Generate table
    autoTable(doc, {
      startY: 30,
      head: [["No.", "Time"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 30 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(
      `Alarm_History_${selectedUser.displayName}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  const columns = [
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
        <button
          onClick={() => {
            setSelectedUser(row);
            toggleModal();
          }}
          className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition"
        >
          Alarm History
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">User Report</h1>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex items-center gap-2 bg-opacity-90 bg-gray-900 shadow-lg hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out"
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

        <div className="p-6">
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            highlightOnHover
            pointerOnHover
            responsive
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

        {isModalOpen && selectedUser && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg z-50 w-full max-w-4xl rounded-xl border border-gray-300">
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-b">
              <h3 className="text-lg font-semibold">
                Alarm History for {selectedUser.displayName}
              </h3>
              <button onClick={toggleModal}>
                <X className="w-5 h-5 text-gray-600 hover:text-red-500" />
              </button>
            </div>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    From:
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    To:
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
                <button
                  onClick={generatePDF}
                  className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Export as PDF
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {filteredAlarmData.length > 0 ? (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-blue-200 text-gray-700 font-medium">
                    <tr>
                      <th className="px-4 py-2 border-b">Count</th>
                      <th className="px-4 py-2 border-b">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlarmData.map((alarm, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{index + 1}</td>
                        <td className="px-4 py-2 border-b">
                          {new Date(alarm.time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">
                  {alarmData.length === 0
                    ? "No alarm history available."
                    : "No alarms found for the selected date range."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserReport;
