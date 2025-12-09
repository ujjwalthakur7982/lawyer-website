import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      alert("Error: Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch('https://nyayconnect-backend-343573523036.asia-south2.run.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        if (data.role === 'Lawyer') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }  
        
      } else {
        alert('Login Failed: ' + data.message);
      }
    } catch (error) {
      alert('Could not connect to the server.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="form-container">
      <motion.form 
        className="form-box" 
        onSubmit={handleLogin}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants}>Welcome Back!</motion.h2>
        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </motion.div>
        <motion.div className="input-group" variants={itemVariants}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </motion.div>
        <motion.button type="submit" className="form-button" variants={itemVariants}>Login</motion.button>
        <motion.p className="form-link" variants={itemVariants}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </motion.p>
      </motion.form>
    </div>
  );
}

export default LoginPage;