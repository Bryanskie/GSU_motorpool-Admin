// ForgotPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire("Missing Email", "Please enter your email address.", "warning");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire(
        "Email Sent",
        "Check your inbox for reset instructions.",
        "success"
      );
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      <form
        onSubmit={handleResetPassword}
        className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Reset Password
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
        >
          Send Reset Link
        </button>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-400 hover:underline focus:outline-none"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </main>
  );
};

export default ForgotPassword;
