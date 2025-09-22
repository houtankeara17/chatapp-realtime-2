import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Restore session on reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
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
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    toast.success("Login successful");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
    navigate("/login");
  };

  const registerSuccess = (userData) => {
    toast.success(`Registered successfully. Welcome, ${userData.nickname}!`);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, registerSuccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};
