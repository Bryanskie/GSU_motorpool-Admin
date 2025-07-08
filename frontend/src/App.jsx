import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./component/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserReport from "./pages/reports";
import AddAdmin from "./pages/AddAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ArchivedUsers from "./pages/ArchivedUsers";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <UserReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/archived-users"
            element={
              <ProtectedRoute>
                <ArchivedUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-admin"
            element={
              <ProtectedRoute>
                <AddAdmin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
