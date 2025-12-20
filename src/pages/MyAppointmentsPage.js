import React, { useState, useEffect } from 'react';

// CSS Styles Component - Isse code clean rehta hai
const Styles = () => (
    <style>{`
        .appointments-container {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .appointments-container h1 { text-align: center; color: #333; margin-bottom: 30px; }
        .appointments-list { list-style: none; padding: 0; }
        .appointment-card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
            transition: transform 0.2s ease-in-out;
        }
        .appointment-card:hover { transform: translateY(-5px); }
        .card-main-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .user-name { font-size: 1.2rem; font-weight: 600; color: #2c3e50; }
        .status-badge { padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; color: white; text-transform: uppercase; }
        .status-pending { background-color: #f39c12; }
        .status-booked { background-color: #3498db; }
        .status-confirmed { background-color: #2ecc71; }
        .status-cancelled { background-color: #e74c3c; }
        .status-completed { background-color: #95a5a6; }
        .status-unknown { background-color: #7f8c8d; }
        .card-date-info { font-size: 1rem; color: #7f8c8d; margin-bottom: 10px; }
        .notes-info { font-size: 0.9rem; color: #555; background-color: #f9f9f9; border-left: 3px solid #3498db; padding: 10px; margin: 0; border-radius: 4px; }
        .error-message { text-align: center; color: #e74c3c; font-size: 1.1rem; }
        .action-buttons { margin-top: 15px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 15px; }
        .action-buttons button { border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; }
        .btn-confirm { background-color: #2ecc71; color: white; }
        .btn-cancel { background-color: #e74c3c; color: white; }
    `}</style>
);

function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');

    // ✅ Naya Azure Backend URL - Sirf yahan change karne se poori file update ho gayi!
    const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

    useEffect(() => {
        const fetchAppointments = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role'); 
            setUserRole(role);

            if (!token) {
                setError("You must be logged in to view appointments.");
                setIsLoading(false);
                return;
            }

            try {
                // ✅ Calling Azure Backend
                const response = await fetch(`${AZURE_BACKEND_URL}/api/my-appointments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Failed to fetch appointments.");
                }

                const data = await response.json();
                setAppointments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        const token = localStorage.getItem('token');
        setError(null);  
        try {
            // ✅ Updating Status on Azure
            const response = await fetch(`${AZURE_BACKEND_URL}/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update status.');
            }
             
            setAppointments(prevAppointments =>
                prevAppointments.map(app =>
                    app.AppointmentID === appointmentId ? { ...app, Status: newStatus } : app
                )
            );
            alert(`Appointment ${newStatus} successfully!`);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const date = new Date(dateString);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleString('en-IN', options);
    };

    if (isLoading) return <div className="appointments-container"><p>Loading your appointments...</p></div>;
    if (error) return <div className="appointments-container error-message"><p>Error: {error}</p></div>;

    return (
        <div className="appointments-container">
            <Styles />
            <h1>My Appointments</h1>
            {appointments.length === 0 ? (
                <p style={{textAlign: 'center'}}>You have no appointments scheduled.</p>
            ) : (
                <ul className="appointments-list">
                    {appointments.map((app) => (
                        <li key={app.AppointmentID} className="appointment-card">
                            <div className="card-main-info">
                                <span className="user-name">
                                    {userRole === 'Client' ? `Lawyer: ${app.LawyerName}` : `Client: ${app.ClientName}`}
                                </span>
                                <span className={`status-badge status-${app.Status ? app.Status.toLowerCase() : 'unknown'}`}>
                                    {app.Status}
                                </span>
                            </div>
                            <div className="card-date-info">Date: {formatDate(app.AppointmentDate)}</div>
                            {app.Notes && <p className="notes-info">Notes: {app.Notes}</p>}

                            {userRole === 'Lawyer' && app.Status === 'Pending' && (
                                <div className="action-buttons">
                                    <button onClick={() => handleStatusUpdate(app.AppointmentID, 'Confirmed')} className="btn-confirm">Confirm</button>
                                    <button onClick={() => handleStatusUpdate(app.AppointmentID, 'Cancelled')} className="btn-cancel">Cancel</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyAppointments;