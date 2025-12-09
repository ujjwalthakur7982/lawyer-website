/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAccountPage.css';

 
const EditIcon = () => ( <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg> );
const CalendarIcon = () => ( <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> );
const LogoutIcon = () => ( <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> );

 
function MyAccountPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

   
  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    
     
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
      setError("Aap logged in nahi hain.");
      setLoading(false);
      return;
    }

    try {
      let apiUrl = '';
      
      // --- URL UPDATED HERE ---
      if (userRole === 'Lawyer') {
        apiUrl = 'https://nyayconnect-backend-343573523036.asia-south2.run.app/api/my-lawyer-profile';
      } else {
        apiUrl = 'https://nyayconnect-backend-343573523036.asia-south2.run.app/api/user/profile';
      }

      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}. Failed to fetch profile.`);
      }

      const data = await response.json();

       
      if (data.success) {
         
        const profileData = userRole === 'Lawyer' ? data.profile : data.user;
        setUserData(profileData);
      } else {
        throw new Error(data.message || 'Profile data format sahi nahi hai.');
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  if (loading) {
    return <div className="feedback-state"><h3>Loading Profile...</h3></div>;
  }

  if (error) {
    return (
      <div className="feedback-state" style={{ color: 'red' }}>
        <h3>{error}</h3>
        <button onClick={fetchUserData}>Try Again</button>
      </div>
    );
  }

  if (!userData) return null;

   
  const joinDate = userData.CreatedAt || userData.joinDate || new Date();
  const formattedJoinDate = new Date(joinDate).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });

  return (
    <div className="myaccount-container">
      { }
      <div className="profile-header">
        <img 
          className="profile-image"
          src={`https://placehold.co/90x90/EBF4FF/333333?text=${(userData.Name || userData.name).charAt(0)}`}
          alt="User Profile"
        />
        <div className="profile-info">
          <h1>{userData.Name || userData.name}</h1>
          <p>{userData.Email || userData.email}</p>
          <div className="profile-meta">
            <span className="user-type-badge">{userData.UserType || userData.role}</span>
            <span className="member-since-text">Member since {formattedJoinDate}</span>
          </div>
        </div>
      </div>

      { }
      <div className="profile-actions">
        <button className="action-button" onClick={() => navigate('/edit-profile')}><EditIcon />Edit Profile</button>
        <button className="action-button" onClick={() => navigate('/appointment-history')}><CalendarIcon />Appointments</button>
        <button className="action-button logout" onClick={handleLogout}><LogoutIcon />Logout</button>
      </div>
      
      { }
      {(userData.UserType === 'Lawyer' || userData.role === 'Lawyer') && (
        <div className="details-section">
          <h3>Professional Information</h3>
          <div className="info-grid">
            <div className="info-item"><label>Specializations</label><p>{userData.Specializations || 'Not specified'}</p></div>
            <div className="info-item"><label>Experience</label><p>{userData.Experience || 0} years</p></div>
            <div className="info-item"><label>City</label><p>{userData.City || 'Not specified'}</p></div>
            <div className="info-item"><label>Consultation Fee</label><p>₹{userData.ConsultationFee || 'Not specified'}</p></div>
            {userData.Bio && <div className="info-item full-width"><label>Bio</label><p>{userData.Bio}</p></div>}
          </div>
        </div>
      )}
      
      { }
      <div className="user-id-footer">
        User ID: {userData.UserID || userData.userId}
      </div>
    </div>
  );
}

export default MyAccountPage;