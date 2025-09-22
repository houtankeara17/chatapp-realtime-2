// src/components/Chat/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import { sendMessage, connectWebSocket } from "../../api/socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function ChatBox({ currentUser, chatUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    connectWebSocket((message) => {
      if (
        (message.sender.id === currentUser.id &&
          message.receiver.id === chatUser.id) ||
        (message.sender.id === chatUser.id &&
          message.receiver.id === currentUser.id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });
  }, [currentUser, chatUser]);

  const handleSend = () => {
    if (text.trim() === "") return;
    sendMessage({
      content: text,
      sender: currentUser,
      receiver: chatUser,
    });
    setText("");
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender.id === currentUser.id ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`p-2 rounded ${
                msg.sender.id === currentUser.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-xs text-right">
                {dayjs(msg.timestamp).fromNow()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
