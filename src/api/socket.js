import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectWebSocket = (onMessageReceived, onConnected) => {
  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
  });

  stompClient.onConnect = (frame) => {
    console.log("WS connected", frame);
    // subscribe to global and personal queue
    stompClient.subscribe("/topic/public", (msg) =>
      onMessageReceived(JSON.parse(msg.body))
    );
    // if onConnected provides userId, subscribe to personal queue
    if (onConnected?.userId) {
      stompClient.subscribe("/queue/messages-" + onConnected.userId, (msg) =>
        onMessageReceived(JSON.parse(msg.body))
      );
    }
    if (onConnected?.callback) onConnected.callback();
  };

  stompClient.activate();
};

export const sendMessage = (payload) => {
  if (!stompClient) return;
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};
