// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    API.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.payload);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Register
  const register = async (formData) => {
    try {
      const res = await API.post("/api/auth/register", formData);
      if (res.data.success) {
        toast.success("Registration successful");
        console.log("✅ Registered user:", res.data.payload);
        navigate("/login");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Registration error");
    }
  };

  // ✅ Login
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    toast.success("Login successful");
    navigate("/home");
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
