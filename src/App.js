import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
// import UserListPage from "./pages/UserListPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <div className="container mx-auto">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
            {/* <Route path="/home" element={<UserListPage />} /> */}
          </Routes>
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
