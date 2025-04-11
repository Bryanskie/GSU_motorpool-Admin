// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Correct import here
import { Navigate } from "react-router-dom";
import React from "react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AuthContext);

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Admin only route
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
