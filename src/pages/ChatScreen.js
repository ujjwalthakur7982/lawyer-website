import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import axios from 'axios';
import './ChatScreen.css';

function ChatScreen() {
  let { lawyerId } = useParams();
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

        // 2. Load History First (Taaki refresh par data na jaye)
        const resMsgs = await axios.get(
          `https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/messages/${rId}`, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setMessages(resMsgs.data.messages || []);

        // 3. Socket Setup
        socket.connect();
        socket.emit("join_room", { room_id: rId });

      } catch (err) {
        console.error("Setup fail:", err);
      }
    };

    if (lawyerId && currentUserId) setupChat();

    // Live listener
    socket.on("receive_message", (data) => {
      // ✅ Consistency check: Socket data ko DB format mein map karo
      const formattedMsg = {
        SenderID: data.sender_id,
        MessageText: data.message,
        Timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, formattedMsg]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [lawyerId, currentUserId]);

  const handleSend = () => {
    if (newMessage.trim() === '' || !roomId) return;

    const msgData = {
      room_id: roomId,
      sender_id: currentUserId,
      message: newMessage
    };

    // Socket pe bhej do (Backend isse DB mein save kar lega humne app.py update kiya tha)
    socket.emit("send_message", msgData);

    setNewMessage('');
  };

  return (
    <div className="chat-page-container">
      <header className="chat-header">
        <h3>Chat Session</h3>
      </header>
      
      <div className="message-list">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-bubble ${ (msg.SenderID || msg.sender_id) === currentUserId ? 'my-message' : 'their-message'}`}
          >
            {/* DB aur Socket dono ke field names cover ho gaye */}
            <p>{msg.MessageText || msg.message}</p>
          </div>
        ))}
      </div>

      <footer className="chat-footer">
        <input 
          type="text" 
          placeholder="Type a message..." 
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