import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  return (
    <nav className="w-full p-3 bg-white border-b flex justify-between items-center">
      <div className="font-bold">ChatApp</div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="text-sm">{user.nickname}</div>
            <img
              className="w-8 h-8 rounded-full"
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${
                  user.nickname || user.username
                }`
              }
            />
            <button
              onClick={() => {
                logout();
                toast.success("Logged out");
                nav("/login");
              }}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
