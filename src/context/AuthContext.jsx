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

  // ✅ Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (!token) {
      setLoading(false);
      return;
    }

    // Re-validate with backend
    API.get("/api/auth/me")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.payload);
          localStorage.setItem("user", JSON.stringify(res.data.payload));
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  // ✅ Register
  const register = async (formData) => {
    try {
      const res = await API.post("/api/auth/register", formData);
      if (res.data.success) {
        toast.success("Registration successful");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch {
      toast.error("Registration error");
    }
  };

  // ✅ Login
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast.success("Login successful");
    navigate("/home");
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
