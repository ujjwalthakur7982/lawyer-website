import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ProfilePage.css';

function ProfilePage() {
  let { lawyerId } = useParams();  
  const [lawyer, setLawyer] = useState(null);  

  // ✅ Naya Azure Backend URL
  const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        // ✅ URL UPDATED TO AZURE
        const response = await fetch(`${AZURE_BACKEND_URL}/api/lawyers/${lawyerId}`);
        const data = await response.json();
        
        if (response.ok) {
          setLawyer(data);  
        } else {
          console.error("Failed to fetch profile:", data.message);
          setLawyer(false);  
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    };

    fetchLawyerProfile();
  }, [lawyerId]);  

  if (lawyer === null) {
    return <div className="loading">Loading Profile...</div>;
  }
  
  if (lawyer === false) {
    return <div className="not-found">Lawyer not found!</div>;
  }

  return (
    <div className="profile-page-background">
      <motion.div 
        className="profile-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <header className="profile-card-header">
          <img className="profile-card-avatar" src={`https://i.pravatar.cc/150?u=${lawyer.UserID}`} alt={lawyer.Name} />
          <h2>{lawyer.Name}</h2>
          <p>{lawyer.Specializations}</p>
        </header>

        <section className="profile-card-stats">
          <div className="stat-item">
            <span>⭐ 4.8</span>
            <p>Rating</p>
          </div>
          <div className="stat-item">
            <span>{lawyer.Experience || lawyer.YearsOfExperience}+</span>
            <p>Years Exp.</p>
          </div>
          <div className="stat-item">
            <span>₹{lawyer.ConsultationFee}</span>
            <p>Starts at</p>
          </div>
        </section>

        <section className="profile-card-bio">
          <h3>About</h3>
          <p>{lawyer.Bio || "No bio available."}</p>
        </section>

        <footer className="profile-card-footer">
          <Link to={`/chat/${lawyer.UserID}`} className="profile-card-button message">Send Message</Link>
          <Link to={`/booking/${lawyer.UserID}`} className="profile-card-button">Book Consultation</Link>
        </footer>
      </motion.div>
    </div>
  );
}

export default ProfilePage;