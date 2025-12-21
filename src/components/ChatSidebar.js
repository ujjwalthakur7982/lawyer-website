import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChatSidebar() {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
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

    const handleRoomClick = (room) => {
        // ✅ Logic: Agar Lawyer login hai toh ClientID pe bhejo, agar Client hai toh LawyerID pe
        const targetId = userRole === 'Lawyer' ? room.RoomID : room.RoomID; 
        
        // Asli logic: Humein hamesha dusre bande ki ID chahiye navigation ke liye
        // Lawyer ke liye dusra banda Client hai, Client ke liye Lawyer.
        const otherPersonId = userRole === 'Lawyer' ? room.ClientID : room.LawyerID;
        
        navigate(`/chat/${otherPersonId}`);
    };

    return (
        <div className="chat-sidebar" style={{ width: '100%', borderRight: '1px solid #ddd', height: '100%', overflowY: 'auto', background: '#fff' }}>
            <h3 style={{ padding: '15px', borderBottom: '1px solid #eee', margin: 0 }}>Recent Chats</h3>
            <div className="room-list">
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div 
                            key={room.RoomID} 
                            onClick={() => handleRoomClick(room)}
                            style={{ 
                                padding: '15px', 
                                borderBottom: '1px solid #eee', 
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                            className="sidebar-item"
                        >
                            <div style={{ fontWeight: 'bold', color: '#333' }}>
                                {userRole === 'Lawyer' ? room.ClientName : room.LawyerName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {room.LastMessage || "New conversation started"}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                        <p>No messages yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatSidebar;