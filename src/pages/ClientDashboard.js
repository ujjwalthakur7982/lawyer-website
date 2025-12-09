// src/pages/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    caseDetails: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'Client') {
      navigate('/unauthorized');
      return;
    }
    
    fetchLawyers();
  }, [navigate]);

  const fetchLawyers = async () => {
    try {
      const response = await fetch('https://nyayconnect-backend-343573523036.asia-south2.run.app/api/lawyers');
      const data = await response.json();
      
      if (data.success) {
        setLawyers(data.lawyers || []);
      } else {
        // Demo data
        setLawyers([
          {
            UserID: 1,
            Name: "Advocate Rajesh Kumar",
            Specializations: "Criminal Law, Civil Law",
            City: "Delhi",
            ConsultationFee: "1500",
            Experience: "10 years"
          },
          {
            UserID: 2,
            Name: "Advocate Priya Sharma",
            Specializations: "Family Law, Divorce",
            City: "Mumbai", 
            ConsultationFee: "2000",
            Experience: "8 years"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    }
  };

  const handleBookAppointment = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://nyayconnect-backend-343573523036.asia-south2.run.app/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lawyerId: selectedLawyer.UserID,
          date: bookingData.date,
          time: bookingData.time,
          caseDetails: bookingData.caseDetails
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Appointment booked successfully!');
        setShowBookingForm(false);
        setBookingData({ date: '', time: '', caseDetails: '' });
      } else {
        alert('Failed to book appointment: ' + data.message);
      }
    } catch (error) {
      alert('Could not connect to server');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <h1>Client Dashboard</h1>
        <p>Find and book appointments with expert lawyers</p>
      </header>

      <div className="client-content">
        <section className="lawyers-section">
          <h2>Available Lawyers</h2>
          
          {lawyers.length === 0 ? (
            <div className="empty-state">
              <p>No lawyers available at the moment</p>
            </div>
          ) : (
            <div className="lawyers-grid">
              {lawyers.map(lawyer => (
                <div key={lawyer.UserID} className="lawyer-card">
                  <div className="lawyer-info">
                    <h3>{lawyer.Name}</h3>
                    <p className="specialization">{lawyer.Specializations}</p>
                    <p className="location">📍 {lawyer.City}</p>
                    <p className="experience">⏳ {lawyer.Experience} experience</p>
                    <p className="fee">💰 Consultation: ₹{lawyer.ConsultationFee}</p>
                  </div>
                  
                  <button 
                    className="book-btn"
                    onClick={() => handleBookAppointment(lawyer)}
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Modal */}
        {showBookingForm && selectedLawyer && (
          <div className="modal-overlay">
            <div className="booking-modal">
              <div className="modal-header">
                <h3>Book Appointment with {selectedLawyer.Name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowBookingForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Case Details:</label>
                  <textarea
                    name="caseDetails"
                    value={bookingData.caseDetails}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your legal issue..."
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowBookingForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;