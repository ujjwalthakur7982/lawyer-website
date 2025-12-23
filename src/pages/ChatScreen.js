import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

function ChatScreen() {
  const { lawyerId } = useParams();
  const userId = parseInt(localStorage.getItem("userId"), 10);
  const token = localStorage.getItem("token");

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!lawyerId || !token) return;

    const initChat = async () => {
      try {
        // 1️⃣ get / create room
        const roomRes = await axios.post(
          "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/get_or_create_room",
          { lawyerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rId = roomRes.data.room_id;
        setRoomId(rId);

        // 2️⃣ load history
        const msgRes = await axios.get(
          `https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/messages/${rId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(msgRes.data.messages || []);

        // 3️⃣ join room (NO connect call)
        socket.emit("join_room", { room_id: rId });
      } catch (err) {
        console.error("Chat setup error:", err);
      }
    };

    initChat();

    // 4️⃣ receive messages
    const handleReceive = (msg) => {
      const formatted = {
        SenderID: msg.sender_id,
        MessageText: msg.message,
        Timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, formatted]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [lawyerId, token]);

  const sendMessage = () => {
    if (!text.trim() || !roomId) return;

    socket.emit("send_message", {
      room_id: roomId,
      sender_id: userId,
      message: text
    });

    setText("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h3>Chat with Lawyer</h3>

      <div style={{
        height: 400,
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 10
      }}>
        {messages.map((m, i) => {
          const sender = m.SenderID;
          const isMine = parseInt(sender) === userId;

          return (
            <div key={i} style={{ textAlign: isMine ? "right" : "left", marginBottom: 8 }}>
              <span style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: isMine ? "#dcf8c6" : "#fff",
                border: isMine ? "none" : "1px solid #ddd"
              }}>
                {m.MessageText}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatScreen;
