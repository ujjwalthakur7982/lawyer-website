import React, { useEffect, useState, useRef } from "react";
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
  const chatEndRef = useRef(null); // Auto-scroll ke liye

  // Auto-scroll function
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!lawyerId || !token) return;

    const initChat = async () => {
      try {
        // 1️⃣ Get ya Create Room
        const roomRes = await axios.post(
          "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/get_or_create_room",
          { lawyerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rId = roomRes.data.room_id;
        setRoomId(rId);

        // 2️⃣ Load Chat History
        const msgRes = await axios.get(
          `https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/messages/${rId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(msgRes.data.messages || []);

        // 3️⃣ Join Socket Room
        socket.emit("join_room", { room_id: rId });
        console.log("Joined room:", rId);
      } catch (err) {
        console.error("Chat setup error:", err);
      }
    };

    initChat();

    // 4️⃣ Receive Real-time Messages
    const handleReceive = (msg) => {
      // Sirf usi room ke messages dikhao jisme user hai
      if (msg.room_id === roomId || roomId === null) {
        const formatted = {
          SenderID: msg.sender_id,
          MessageText: msg.message,
          Timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, formatted]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [lawyerId, token, roomId]); // roomId add kiya taaki listener update ho jaye

  const sendMessage = () => {
    if (!text.trim() || !roomId) return;

    const messageData = {
      room_id: roomId,
      sender_id: userId,
      message: text
    };

    // Socket pe message bhejo
    socket.emit("send_message", messageData);

    setText("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial" }}>
      <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>Chat with Lawyer</h3>

      <div style={{
        height: "500px",
        overflowY: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)"
      }}>
        {messages.map((m, i) => {
          const isMine = parseInt(m.SenderID) === userId;

          return (
            <div key={i} style={{ 
              display: "flex", 
              justifyContent: isMine ? "flex-end" : "flex-start", 
              marginBottom: "12px" 
            }}>
              <div style={{
                maxWidth: "70%",
                padding: "10px 15px",
                borderRadius: isMine ? "15px 15px 0 15px" : "15px 15px 15px 0",
                background: isMine ? "#007bff" : "#ffffff",
                color: isMine ? "#fff" : "#333",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                border: isMine ? "none" : "1px solid #eee"
              }}>
                <div style={{ fontSize: "15px" }}>{m.MessageText}</div>
                <div style={{ fontSize: "10px", marginTop: "5px", opacity: 0.7, textAlign: "right" }}>
                  {m.Timestamp ? new Date(m.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} /> 
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <input
          style={{ 
            flex: 1, 
            padding: "12px", 
            borderRadius: "25px", 
            border: "1px solid #ccc",
            outline: "none"
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Apna sawaal likhein..."
        />
        <button 
          onClick={sendMessage}
          style={{
            padding: "10px 25px",
            borderRadius: "25px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatScreen;