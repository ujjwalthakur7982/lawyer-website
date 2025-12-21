import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChatSidebar() {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Backend se rooms ki list maango
                const res = await axios.get('https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net/api/chat/rooms', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.data.success) {
                    setRooms(res.data.rooms);
                }
            } catch (err) {
                console.error("Sidebar load fail:", err);
            }
        };
        fetchRooms();
    }, []);

    return (
        <div className="chat-sidebar" style={{ width: '300px', borderRight: '1px solid #ddd', height: '80vh', overflowY: 'auto' }}>
            <h3 style={{ padding: '15px' }}>My Conversations</h3>
            <div className="room-list">
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div 
                            key={room.RoomID} 
                            onClick={() => navigate(`/chat/${room.ClientID || room.LawyerID}`)}
                            style={{ 
                                padding: '15px', 
                                borderBottom: '1px solid #eee', 
                                cursor: 'pointer',
                                background: '#fff'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <div style={{ fontWeight: 'bold' }}>
                                {room.ClientName || room.LawyerName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {room.LastMessage || "Start a conversation..."}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '20px', color: '#999' }}>No chats yet.</p>
                )}
            </div>
        </div>
    );
}

export default ChatSidebar;