import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LawyerDetailsPage.css';

function LawyerDetailsPage() {
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const navigate = useNavigate();

  const handleSubmitDetails = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Error: You are not logged in. Please log in again to complete your profile.");
      navigate('/login');
      return;
    }
    
    try {
      // --- URL UPDATED HERE ---
      const response = await fetch('https://nyayconnect-backend-343573523036.asia-south2.run.app/api/lawyer-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, specializations, experience, city, consultationFee })
      });
      const data = await response.json();
      if (data.success) {
        alert('Profile details saved successfully! You can now be found by clients.');
        navigate('/home');
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Could not connect to the server.");
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="form-container">
      <motion.form
        className="form-box"
        onSubmit={handleSubmitDetails}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants}>Complete Your Profile</motion.h2>
        <motion.p variants={itemVariants} className="form-tagline">
          Please provide your professional details to be listed.
        </motion.p>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="bio">About / Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="specializations">Specializations (e.g., Criminal, Property)</label>
          <input type="text" id="specializations" value={specializations} onChange={(e) => setSpecializations(e.target.value)} required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="experience">Years of Experience</label>
          <input type="number" id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="city">City</label>
          <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="consultationFee">Consultation Fee (in INR)</label>
          <input type="number" id="consultationFee" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required />
        </motion.div>

        <motion.button type="submit" className="form-button" variants={itemVariants}>
          Save and Complete Profile
        </motion.button>
      </motion.form>
    </div>
  );
}

export default LawyerDetailsPage;