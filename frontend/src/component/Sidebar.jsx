// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white p-6">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <ul>
        <li className="mb-4">
          <Link to="/admin/dashboard" className="hover:text-gray-400">Dashboard</Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/pending-accounts" className="hover:text-gray-400">Pending Accounts</Link>
        </li>
        <li className="mb-4">
          <Link to="/admin/users" className="hover:text-gray-400">Users</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
