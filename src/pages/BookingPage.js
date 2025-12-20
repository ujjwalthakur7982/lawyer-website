import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// CSS styles embedded directly inside the component.
const styles = `
    .booking-page-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        background-color: #f0f4f8;
        padding: 40px 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .booking-card {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 700px;
        padding: 30px 40px;
    }
    .lawyer-details {
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 20px;
        margin-bottom: 25px;
    }
    .lawyer-details h1 {
        font-size: 1.5rem;
        color: #1a202c;
        font-weight: 600;
    }
    .lawyer-details .lawyer-name {
        font-size: 2rem;
        color: #2b6cb0;
        margin-top: 5px;
        font-weight: 700;
    }
    .lawyer-details .lawyer-spec {
        font-size: 1rem;
        color: #718096;
        margin-top: 5px;
    }
    .form-section {
        margin-bottom: 25px;
    }
    .form-section label {
        display: block;
        font-size: 1.1rem;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 10px;
    }
    .date-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 1rem;
    }
    .time-slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 15px;
    }
    .time-slot-btn {
        background-color: #edf2f7;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .time-slot-btn:hover {
        background-color: #e2e8f0;
    }
    .time-slot-btn.selected {
        background-color: #2b6cb0;
        color: #ffffff;
        border-color: #2b6cb0;
    }
    .notes-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 1rem;
        resize: vertical;
        min-height: 100px;
    }
    .confirm-booking-btn {
        width: 100%;
        background-color: #38a169;
        color: white;
        padding: 15px;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
    }
    .confirm-booking-btn:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }
    .error-message, .success-message {
        text-align: center;
        margin-top: 20px;
        font-size: 1rem;
        font-weight: 600;
        padding: 12px;
        border-radius: 8px;
    }
    .error-message {
        color: #9b2c2c;
        background-color: #fed7d7;
    }
    .success-message {
        color: #2f855a;
        background-color: #c6f6d5;
    }
`;

function BookingPage() {
    const { lawyerId } = useParams();
    const [lawyer, setLawyer] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ✅ Naya Azure Backend URL variable
    const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

    useEffect(() => {
        const fetchLawyerDetails = async () => {
            if (!lawyerId) {
                setError("Lawyer ID not found in URL.");
                return;
            }
            try {
                // ✅ Updated to Azure URL
                const response = await fetch(`${AZURE_BACKEND_URL}/api/lawyers/${lawyerId}`);
                if (!response.ok) {
                    throw new Error('Could not fetch lawyer details.');
                }
                const data = await response.json();
                setLawyer(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchLawyerDetails();
    }, [lawyerId]);

    const handleConfirmBooking = async () => {
        setError('');
        setSuccessMessage('');
        if (!selectedDate || !selectedTime) {
            setError('Please select a valid date and time slot.');
            return;
        }
        setIsLoading(true);
        try {
            const [year, month, day] = selectedDate.split('-');
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            const finalAppointmentDate = new Date(year, month - 1, day, hours, minutes);
            const bookingData = {
                lawyerId: parseInt(lawyerId, 10),
                appointmentDate: finalAppointmentDate.toISOString(),
                notes: notes,
            };
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You must be logged in to book an appointment.");
                setIsLoading(false);
                return;
            }
            // ✅ Updated to Azure URL
            const response = await fetch(`${AZURE_BACKEND_URL}/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }
            setSuccessMessage('Your appointment has been booked successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!lawyer && !error) {
        return <div className="booking-page-container"><p>Loading lawyer details...</p></div>;
    }
    
    const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];

    return (
        <>
            <style>{styles}</style>
            <div className="booking-page-container">
                <div className="booking-card">
                    <div className="lawyer-details">
                        <h1>Book an Appointment with</h1>
                        <p className="lawyer-name">{lawyer?.Name || 'Lawyer'}</p>
                        <p className="lawyer-spec">{lawyer?.Specializations || 'Specialist'}</p>
                    </div>

                    <div className="form-section">
                        <label>1. Select a Date</label>
                        <input
                            type="date"
                            className="date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="form-section">
                        <label>2. Select a Time Slot</label>
                        <div className="time-slots-grid">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="notes">3. Notes for the Lawyer (Optional)</label>
                        <textarea
                            id="notes"
                            className="notes-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Provide a brief summary of your case..."
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <button
                        className="confirm-booking-btn"
                        onClick={handleConfirmBooking}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Booking...' : 'Confirm Your Booking'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default BookingPage;