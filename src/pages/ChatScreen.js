import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import axios from 'axios';
import './ChatScreen.css';

function ChatScreen() {
  const { lawyerId } = useParams();
  const currentUserId = parseInt(localStorage.getItem('userId')); 
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const setupChat = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Get RoomID
        const resRoom = await axios.post(
          'https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/get_or_create_room', 
          { lawyerId: lawyerId }, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        const rId = resRoom.data.room_id;
        setRoomId(rId);

        // 2. Load History (Database se fetch)
        const resMsgs = await axios.get(
          `https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/messages/${rId}`, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // History set kar di
        setMessages(resMsgs.data.messages || []);

        // 3. Socket Setup & Room Join
        socket.connect();
        socket.emit("join_room", { room_id: rId });

      } catch (err) {
        console.error("Chat Setup Error:", err);
      }
    };

    if (lawyerId) {
      setupChat();
    }

    // Live Socket Listener
    socket.on("receive_message", (data) => {
      // ✅ Socket data ko Messages array mein add karo
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [lawyerId]); // Depend on lawyerId only

  const handleSend = () => {
    if (newMessage.trim() === '' || !roomId) return;

    const msgData = {
      room_id: roomId,
      sender_id: currentUserId,
      message: newMessage
    };

    // Socket emit (app.py isse receive karke DB mein save kar raha hai)
    socket.emit("send_message", msgData);
    setNewMessage('');
  };

  return (
    <div className="chat-page-container">
      <header className="chat-header">
        <h3>Chat Room</h3>
      </header>
      
      <div className="message-list">
        {messages.map((msg, index) => {
          // ✅ DB se 'SenderID' aur 'MessageText' aata hai
          // ✅ Socket se 'sender_id' aur 'message' aata hai
          const sender = msg.SenderID || msg.sender_id;
          const text = msg.MessageText || msg.message;

          return (
            <div 
              key={index} 
              className={`message-bubble ${sender == currentUserId ? 'my-message' : 'their-message'}`}
            >
              <p>{text}</p>
            </div>
          );
        })}
      </div>

      <footer className="chat-footer">
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </footer>
    </div>
  );
}

export default ChatScreen;