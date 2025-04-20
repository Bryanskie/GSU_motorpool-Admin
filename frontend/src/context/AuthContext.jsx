// src/context/AuthContext.jsx

import React, { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase"; // ✅ make sure 'app' is actually exported from firebase.js

// Explicitly export AuthContext here
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 added

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // 👈 stop loading after checking auth
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // 👈 or a nice spinner
  }

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

// Custom hook for easier access to AuthContext
export const useAuth = () => useContext(AuthContext);
