import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './LawyerDashboard.css';

function LawyerDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [profileData, setProfileData] = useState({
    bio: '',
    specializations: '',
    experience: '',
    city: '',
    consultationFee: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Naya Azure Backend URL variable
  const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

  const fetchAppointments = async (token) => {
    try {
      setLoading(true);
      // ✅ Updated to Azure URL
      const response = await fetch(`${AZURE_BACKEND_URL}/api/lawyer/appointments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        console.error("Appointments error:", data.message);
      }
    } catch (error) { 
      console.error("Error fetching appointments:", error);
      setAppointments([
        {
          AppointmentID: 1,
          ClientName: "Demo Client",
          Date: "2024-01-15",
          Time: "10:00 AM",
          Status: "pending",
          CaseDetails: "Property consultation needed"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      // ✅ Updated to Azure URL
      const response = await fetch(`${AZURE_BACKEND_URL}/api/my-lawyer-profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      if (data.success && data.profile) {
        setProfileData({
          bio: data.profile.Bio || '',
          specializations: data.profile.Specializations || '',
          experience: data.profile.Experience || '',
          city: data.profile.City || '',
          consultationFee: data.profile.ConsultationFee || ''
        });
      }
    } catch (error) { 
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }
    fetchAppointments(token);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (activeTab === 'appointments') {
      fetchAppointments(token);
    } else if (activeTab === 'profile') {
      fetchProfile(token);
    }
  }, [activeTab]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // ✅ Updated to Azure URL
      const response = await fetch(`${AZURE_BACKEND_URL}/api/my-lawyer-profile`, {
        method: 'POST',  
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert("Failed to update profile: " + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    const token = localStorage.getItem('token');
    try {
      // ✅ Updated to Azure URL
      const response = await fetch(`${AZURE_BACKEND_URL}/api/lawyer/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Appointment ${status} successfully!`);
        fetchAppointments(token);  
      } else {
        alert("Failed to update appointment: " + data.message);
      }
    } catch (error) {
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Lawyer Dashboard</h1>
      </header>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`} 
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
      </div>

      <div className="dashboard-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="appointments-section">
            <h2>Appointment Requests</h2>
            {appointments.length === 0 ? (
              <div className="empty-state"><p>No appointments found</p></div>
            ) : (
              <div className="appointments-list">
                {appointments.map(appointment => (
                  <div key={appointment.AppointmentID} className="appointment-card">
                    <div className="appointment-header">
                      <h3>{appointment.ClientName}</h3>
                      <span className={`status-badge ${appointment.Status}`}>{appointment.Status}</span>
                    </div>
                    <div className="appointment-details">
                      <p><strong>Date:</strong> {appointment.Date}</p>
                      <p><strong>Time:</strong> {appointment.Time}</p>
                      {appointment.CaseDetails && <p><strong>Case:</strong> {appointment.CaseDetails}</p>}
                    </div>
                    {appointment.Status === 'pending' && (
                      <div className="appointment-actions">
                        <button className="btn-accept" onClick={() => updateAppointmentStatus(appointment.AppointmentID, 'confirmed')}>Accept</button>
                        <button className="btn-reject" onClick={() => updateAppointmentStatus(appointment.AppointmentID, 'cancelled')}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-section">
            <h2>Edit Your Profile</h2>
            <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
              <div className="input-group">
                <label htmlFor="bio">About / Bio</label>
                <textarea id="bio" name="bio" value={profileData.bio} onChange={handleInputChange} rows="4" required />
              </div>
              <div className="input-group">
                <label htmlFor="specializations">Specializations</label>
                <input type="text" id="specializations" name="specializations" value={profileData.specializations} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="experience">Years of Experience</label>
                <input type="number" id="experience" name="experience" value={profileData.experience} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="city">City</label>
                <input type="text" id="city" name="city" value={profileData.city} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="consultationFee">Consultation Fee (₹)</label>
                <input type="number" id="consultationFee" name="consultationFee" value={profileData.consultationFee} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="form-button" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LawyerDashboard;