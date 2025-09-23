// src/websocket/websocket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export let stompClient = null;

export const connectWebSocket = (onMessageReceived, onConnected) => {
  const socket = new SockJS("http://localhost:8080/ws"); // Backend WebSocket endpoint
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => console.log(str),
  });

  stompClient.onConnect = () => {
    console.log("✅ Connected to WebSocket");
    if (onConnected) onConnected();
  };

  stompClient.onStompError = (frame) => {
    console.error("❌ STOMP error:", frame);
  };

  stompClient.activate();

  stompClient.onWebSocketClose = () => {
    console.warn("⚠️ WebSocket disconnected. Retrying...");
  };

  // Subscribe to incoming messages
  if (onMessageReceived) {
    stompClient.onConnect = () => {
      stompClient.subscribe("/user/queue/messages", (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    };
  }
};
