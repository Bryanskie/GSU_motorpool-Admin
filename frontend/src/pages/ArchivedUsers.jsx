import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import DataTable from "react-data-table-component";
import { Search } from "lucide-react";
import Swal from "sweetalert2";

const ArchivedUsers = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#111827",
        opacity: 1,
        color: "#ffffff",
        fontSize: "15px",
      },
    },
  };

  const handleEnable = async (email) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to enable ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, enable!",
    });

    if (result.isConfirmed) {
      try {
        await axios.put("http://localhost:5000/api/admin/enable-user", {
          email,
        });

        // Remove the user from the list
        setArchivedUsers((prev) => prev.filter((user) => user.email !== email));

        Swal.fire("Enabled!", `${email} has been enabled.`, "success");
      } catch (error) {
        console.error("Failed to enable user:", error);
        Swal.fire("Error", "Failed to enable user. Please try again.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/disabled-users"
        );
        setArchivedUsers(response.data);
      } catch (error) {
        console.error("Error fetching archived users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedUsers();
  }, []);

  const filteredUsers = archivedUsers.filter((user) => {
    const name = user.displayName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const columns = [
    {
      name: "Name",
      selector: (row) => row.displayName || "N/A",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
    },
    {
      name: "Role",
      selector: (row) => row.role || "user",
      sortable: false,
    },
    {
      name: "Status",
      cell: (row) => (
        <span className="text-red-600 font-semibold">Disabled</span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => handleEnable(row.email)}
          className="text-green-600 font-semibold hover:underline"
        >
          Enable
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-50 to-gray-100 relative">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Archived Users
          </h1>
        </div>
        <div className="p-6 rounded-xl">
          <DataTable
            columns={columns}
            data={filteredUsers}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            responsive
            subHeader
            customStyles={customStyles}
            subHeaderComponent={
              <div className="relative w-full max-w-md">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
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
      </div>
    </div>
  );
};

export default ArchivedUsers;
