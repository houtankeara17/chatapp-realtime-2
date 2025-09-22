// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Restore session on page reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/api/auth/me")
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.payload);
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    toast.success("Login successful");
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
