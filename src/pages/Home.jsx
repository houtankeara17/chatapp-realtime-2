import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // Fetch all users
  useEffect(() => {
    if (!user) return;
    API.get("/api/auth/users")
      .then((res) => {
        if (res.data.success) {
          // Exclude self
          setUsers(res.data.payload.filter((u) => u.id !== user.id));
        } else {
          toast.error(res.data.message || "Failed to fetch users");
        }
      })
      .catch(() => toast.error("Failed to fetch users"));
  }, [user]);

  const handleChat = (u) => navigate(`/chat/${u.id}`);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Welcome, {user?.nickname}</h2>
      <button
        onClick={logout}
        className="mb-4 px-3 py-1 bg-red-500 text-white rounded"
      >
        Logout
      </button>

      <h3 className="text-lg mb-2">Users to chat with:</h3>
      {users.length === 0 && <p>No users available.</p>}
      <ul>
        {users.map((u) => (
          <li
            key={u.id}
            onClick={() => handleChat(u)}
            className="cursor-pointer p-2 border rounded mb-2 hover:bg-gray-100"
          >
            {u.nickname} ({u.username})
          </li>
        ))}
      </ul>
    </div>
  );
}
