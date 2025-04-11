// src/context/AuthContext.jsx

import React, { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase"; // ✅ make sure 'app' is actually exported from firebase.js

// Explicitly export AuthContext here
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier access to AuthContext
export const useAuth = () => useContext(AuthContext);
