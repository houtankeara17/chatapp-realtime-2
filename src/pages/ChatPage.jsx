import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { id } = useParams(); // receiver id
  const { user } = useContext(AuthContext);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  // Fetch receiver info
  useEffect(() => {
    if (!user) return navigate("/login");
    const fetchReceiver = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const r = res.data.payload.find((u) => u.id === parseInt(id));
        setReceiver(r);
      } catch (err) {
        toast.error("Failed to load user");
      }
    };
    fetchReceiver();
  }, [id, user, navigate]);

  // Fetch chat history
  useEffect(() => {
    if (!user || !receiver) return;
    const fetchHistory = async () => {
      try {
        const res = await API.get("/api/messages/history", {
          params: { user1: user.id, user2: receiver.id },
        });
        setMessages(res.data);
      } catch (err) {
        toast.error("Failed to load history");
      }
    };
    fetchHistory();
  }, [user, receiver]);

  // Setup STOMP
  useEffect(() => {
    if (!user) return;
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/queue/messages-${user.id}`, (msg) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    };
    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [user]);

  const sendMessage = () => {
    if (!text.trim() || !user || !receiver) return;
    const payload = {
      content: text,
      sender: { id: user.id },
      receiver: { id: receiver.id },
    };
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });
    setText("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 border rounded shadow flex flex-col h-[80vh]">
      {receiver && (
        <div className="mb-4 flex items-center gap-3 border-b pb-2">
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
            {receiver.nickname[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{receiver.nickname}</div>
            <div className="text-sm text-gray-500">{receiver.username}</div>
          </div>
          <button
            className="ml-auto text-blue-500"
            onClick={() => navigate("/")}
          >
            Prev
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto mb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-2 flex ${
              m.sender.id === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded max-w-xs break-words ${
                m.sender.id === user.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.content}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(m.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
