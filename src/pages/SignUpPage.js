import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SignUpPage.css';

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client');
  const navigate = useNavigate();

  // ✅ Naya Azure Backend URL
  const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

  const handleSignUp = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address (e.g., user@gmail.com).");
        return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    try {
      // ✅ URL UPDATED TO AZURE
      const response = await fetch(`${AZURE_BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        if (role === 'Lawyer') {
          alert('Account created! Please complete your professional profile.');
          navigate('/complete-profile');  
        } else {
          alert('Account created successfully! Please login.');
          navigate('/login');  
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Connection Error:', error);
      alert('Could not connect to the server.');
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
        onSubmit={handleSignUp}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants}>Create an Account</motion.h2>
        
        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </motion.div>

        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </motion.div>
        
        <motion.div className="input-group" variants={itemVariants}>
          <label>I am a:</label>
          <div className="role-selector">
            <button type="button" className={role === 'Client' ? 'active' : ''} onClick={() => setRole('Client')}>Client</button>
            <button type="button" className={role === 'Lawyer' ? 'active' : ''} onClick={() => setRole('Lawyer')}>Lawyer</button>
          </div>
        </motion.div>

        <motion.button type="submit" className="form-button" variants={itemVariants}>Sign Up</motion.button>
        
        <motion.p className="form-link" variants={itemVariants}>
          Already have an account? <Link to="/login">Login</Link>
        </motion.p>
      </motion.form>
    </div>
  );
}

export default SignUpPage;