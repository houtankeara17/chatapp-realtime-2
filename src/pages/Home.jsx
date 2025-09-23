import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const navigate = useNavigate();
  const [stompClient, setStompClient] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // Fetch all users
  useEffect(() => {
    if (!user) return;
    API.get("/api/auth/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => setUsers(res.data.payload.filter((u) => u.id !== user.id)))
      .catch(() => toast.error("Failed to load users"));
  }, [user]);

  // Fetch unread counts
  useEffect(() => {
    if (!user) return;
    const fetchUnreads = async () => {
      try {
        const res = await API.get("/api/messages/unread", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnread(res.data || {});
      } catch (err) {
        console.error("❌ Fetch unreads failed:", err);
      }
    };
    fetchUnreads();
  }, [user]);

  // STOMP live updates
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      client.subscribe(`/queue/messages-${user.id}`, (msg) => {
        const received = JSON.parse(msg.body);

        setUnread((prev) => ({
          ...prev,
          [received.sender.id]: (prev[received.sender.id] || 0) + 1,
        }));

        toast(
          `New message from ${received.sender.nickname}: ${received.content}`,
          {
            icon: "💬",
          }
        );

        if (Notification.permission === "granted") {
          new Notification(`New message from ${received.sender.nickname}`, {
            body: received.content,
            icon: "/chat-icon.png",
          });
        }
      });
    };

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
  }, []);

  const handleChat = (u) => {
    setUnread((prev) => ({ ...prev, [u.id]: 0 }));
    navigate(`/chat/${u.id}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Welcome, {user?.nickname}</h2>
      <ul>
        {users.map((u) => (
          <li
            key={u.id}
            onClick={() => handleChat(u)}
            className="cursor-pointer p-2 border rounded mb-2 hover:bg-gray-100 flex justify-between items-center"
          >
            <span>
              {u.nickname} ({u.username})
            </span>
            {unread[u.id] > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unread[u.id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
