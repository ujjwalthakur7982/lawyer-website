import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AppointmentHistoryPage.css';

function AppointmentHistoryPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real appointments data from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('https://nyayconnect-backend-343573523036.asia-south2.run.app/api/appointment-history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setAppointments(data.appointments);
        } else {
          setError(data.message || 'Failed to load appointments');
          // Fallback to dummy data
          setAppointments([
            {
              id: 'APT-001',
              date: '2024-01-15',
              lawyerName: 'Advocate Raj Sharma',
              specialization: 'Criminal Law',
              fee: 2000,
              status: 'Completed',
              duration: '30 mins'
            },
            {
              id: 'APT-002',
              date: '2024-01-10',
              lawyerName: 'Advocate Priya Singh',
              specialization: 'Family Law',
              fee: 1500,
              status: 'Confirmed',
              duration: '45 mins'
            },
            {
              id: 'APT-003',
              date: '2024-01-05',
              lawyerName: 'Advocate Amit Kumar',
              specialization: 'Corporate Law',
              fee: 3000,
              status: 'Cancelled',
              duration: '60 mins'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to connect to server');
        // Fallback to dummy data
        setAppointments([
          {
            id: 'APT-001',
            date: '2024-01-15',
            lawyerName: 'Advocate Raj Sharma',
            specialization: 'Criminal Law',
            fee: 2000,
            status: 'Completed',
            duration: '30 mins'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'Confirmed': return '#007bff';
      case 'Pending': return '#ffc107';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Completed': return 'Completed';
      case 'Confirmed': return 'Confirmed';
      case 'Pending': return 'Pending';
      case 'Cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="appointment-history-container">
        <div className="loading">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointment-history-container">
      <motion.div 
        className="appointment-history-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="appointment-header">
          <h2>Appointment History</h2>
          <p>Your consultation history with lawyers</p>
        </div>

        {error && (
          <div className="error-message">
            {error} (Showing demo data)
          </div>
        )}

        <div className="appointments-list">
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-state-icon">📅</div>
              <h3>No Appointments Yet</h3>
              <p>You haven't booked any consultations yet.</p>
              <button 
                className="book-appointment-btn"
                onClick={() => navigate('/')}
              >
                Find Lawyers
              </button>
            </div>
          ) : (
            appointments.map((appointment, index) => (
              <motion.div 
                key={appointment.id || index}
                className="appointment-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="appointment-info">
                  <div className="appointment-main">
                    <h4 className="appointment-id">{appointment.id}</h4>
                    <p className="appointment-date">{formatDate(appointment.date)}</p>
                    <div className="lawyer-details">
                      <h5 className="lawyer-name">{appointment.lawyerName || appointment.clientName || 'Unknown'}</h5>
                      <p className="specialization">{appointment.specialization || 'General Law'}</p>
                    </div>
                  </div>
                  <div className="appointment-details">
                    <span className="appointment-duration">{appointment.duration || '30 mins'}</span>
                    <span className="appointment-fee">₹{(appointment.fee || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="appointment-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="appointment-actions">
          <button 
            className="back-btn"
            onClick={() => navigate('/my-account')}
          >
            Back to Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AppointmentHistoryPage;