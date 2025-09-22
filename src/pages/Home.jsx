import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          // Exclude self
          setUsers(res.data.payload.filter((u) => u.id !== user.id));
        }
      } catch (err) {
        toast.error("Failed to fetch users");
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">All Users</h2>
      {users.length === 0 && <p>No users found</p>}
      <ul>
        {users.map((u) => (
          <li
            key={u.id}
            className="p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100"
            onClick={() => nav(`/chat/${u.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                {u.nickname[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{u.nickname}</div>
                <div className="text-sm text-gray-500">{u.username}</div>
              </div>
            </div>
            <div>💬</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
