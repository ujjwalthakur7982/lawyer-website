import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket'; // Ensure path is correct
import axios from 'axios';
import './ChatScreen.css';

function ChatScreen() {
  let { lawyerId } = useParams();
  
  // LocalStorage se ID nikal kar Number mein convert kiya
  const currentUserId = parseInt(localStorage.getItem('userId')); 
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const setupChat = async () => {
      try {
        // 1. Backend se RoomID mangwao ya naya banwao
        const resRoom = await axios.post(
          'https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/get_or_create_room', 
          { lawyerId: lawyerId }, 
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        
        const rId = resRoom.data.room_id;
        setRoomId(rId);

        // 2. Socket connect aur room join
        socket.connect();
        socket.emit("join_room", { room_id: rId });

        // 3. Purani chat history load karo
        const resMsgs = await axios.get(
          `https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/messages/${rId}`, 
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        setMessages(resMsgs.data.messages || []);
      } catch (err) {
        console.error("Chat setup fail ho gaya bhai:", err);
      }
    };

    if (lawyerId && currentUserId) {
      setupChat();
    }

    // Live message listener
    socket.on("receive_message", (data) => {
      // Check taaki usi room ka message dikhe
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [lawyerId, currentUserId]);

  const handleSend = async () => {
    if (newMessage.trim() === '' || !roomId) return;

    const msgData = {
      room_id: roomId,
      sender_id: currentUserId,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    // A. Live bhej do socket pe
    socket.emit("send_message", msgData);

    // B. Permanent save karo Azure DB mein
    try {
      await axios.post(
        'https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/send', 
        { room_id: roomId, message: newMessage }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
    } catch (err) {
      console.error("Database save error:", err);
    }

    // UI update (Bhejne wale ke liye)
    setMessages((prev) => [...prev, msgData]);
    setNewMessage('');
  };

  return (
    <div className="chat-page-container">
      <header className="chat-header">
        <h3>Chat with Lawyer ID: {lawyerId}</h3>
      </header>
      
      <div className="message-list">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-bubble ${msg.sender_id === currentUserId ? 'my-message' : 'their-message'}`}
          >
            {/* MessageText DB se aata hai, .message Socket se */}
            <p>{msg.MessageText || msg.message}</p>
          </div>
        ))}
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