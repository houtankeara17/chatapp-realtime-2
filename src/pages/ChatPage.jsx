import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const { id: receiverId } = useParams();
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  // Fetch receiver info
  useEffect(() => {
    if (!user) return;

    API.get("/api/auth/users", config)
      .then((res) => {
        const u = res.data.payload.find(
          (u) => u.id === parseInt(receiverId, 10)
        );
        if (!u) toast.error("User not found");
        else setReceiver(u);
      })
      .catch(() => toast.error("Failed to load user"));
  }, [receiverId, user]);

  // Fetch chat history + mark as read
  useEffect(() => {
    if (!user || !receiver) return;

    // Fetch chat history
    API.get("/api/messages/history", {
      params: { user1: user.id, user2: receiver.id },
    })
      .then((res) => setMessages(res.data))
      .catch(() => toast.error("Failed to load chat history"));

    // Mark messages as read
    API.put("/api/messages/read", null, {
      params: { senderId: receiver.id },
    }).catch(() => console.warn("⚠️ Failed to mark as read"));
  }, [user, receiver]);

  // STOMP connection
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/queue/messages-${user.id}`, (msg) => {
        const received = JSON.parse(msg.body);
        setMessages((prev) => [...prev, received]);
      });
    };

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, [user]);

  const sendMessage = () => {
    if (!input || !stompClient || !receiver) return;

    const payload = {
      content: input,
      sender: { id: user.id },
      receiver: { id: receiver.id },
    };

    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    setInput("");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">
        Chat with {receiver?.nickname || "loading..."}
      </h2>

      <div className="border h-[400px] overflow-y-auto p-2 mb-4 flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id || Math.random()}
            className={`p-2 rounded max-w-xs ${
              m.sender.id === user.id
                ? "bg-blue-200 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            <div className="text-sm font-semibold">{m.sender.nickname}</div>
            <div>{m.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(m.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
