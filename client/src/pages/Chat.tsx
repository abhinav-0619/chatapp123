import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();

    socket.on("receive_message", (data: string) => {
      console.log("Received:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!message) return;

    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}