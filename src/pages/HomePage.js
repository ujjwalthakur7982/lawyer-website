import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaComments, FaHandshake, FaGavel, FaUsers, FaBriefcase, FaBuilding, FaGlobe } from 'react-icons/fa';
import './HomePage.css';

function HomePage() {
  const [lawyers, setLawyers] = useState([]);
  const [allLawyers, setAllLawyers] = useState([]); // Store all lawyers
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ✅ Naya Azure Backend URL
  const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

  // Manual search function
  const handleSearch = () => {
    if (tempSearchTerm.trim() === '') {
      setSearchTerm('');
      setLawyers(allLawyers); // Show all lawyers
      return;
    }
    
    setSearchTerm(tempSearchTerm);
    setIsSearching(true);
    
    // Frontend filtering for better search
    const filtered = allLawyers.filter(lawyer => 
      lawyer.Name.toLowerCase().includes(tempSearchTerm.toLowerCase()) ||
      lawyer.Specializations.toLowerCase().includes(tempSearchTerm.toLowerCase()) ||
      (lawyer.Location && lawyer.Location.toLowerCase().includes(tempSearchTerm.toLowerCase()))
    );
    
    setLawyers(filtered);
    setIsSearching(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch all lawyers
  const fetchAllLawyers = async () => {
    try {
      setIsSearching(true);
      console.log('🔄 Fetching ALL lawyers from Azure...');
      
      // ✅ URL UPDATED TO AZURE
      const response = await fetch(`${AZURE_BACKEND_URL}/api/lawyers`);
      const data = await response.json();
      console.log('📊 RAW API Response:', data);
      
      // Transform API data to match our expected format
      const transformedLawyers = data.map(lawyer => ({
        UserID: lawyer.UserID,
        Name: lawyer.Name || 'Unknown',
        Specializations: lawyer.Specializations || 'Not specified',
        Experience: lawyer.Experience || lawyer.YearsOfExperience || 0,
        Location: lawyer.Location || lawyer.City || 'Not specified',
        Rating: lawyer.Rating || 4.0,
        ConsultationFee: lawyer.ConsultationFee || 'Not specified'
      }));
      
      console.log('🎯 Transformed Lawyers:', transformedLawyers);
      setAllLawyers(transformedLawyers); // Store all lawyers
      setLawyers(transformedLawyers); // Show all lawyers initially
      
    } catch (error) {
      console.error('❌ API Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch with search from API + frontend filter
  const fetchSearchedLawyers = async (search, category) => {
    try {
      setIsSearching(true);
      
      // ✅ URL UPDATED TO AZURE
      let url = `${AZURE_BACKEND_URL}/api/lawyers`;
      const params = [];
      
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Transform API data
      const transformedLawyers = data.map(lawyer => ({
        UserID: lawyer.UserID,
        Name: lawyer.Name || 'Unknown',
        Specializations: lawyer.Specializations || 'Not specified',
        Experience: lawyer.Experience || lawyer.YearsOfExperience || 0,
        Location: lawyer.Location || lawyer.City || 'Not specified',
        Rating: lawyer.Rating || 4.0,
        ConsultationFee: lawyer.ConsultationFee || 'Not specified'
      }));
      
      // Additional frontend filtering for better accuracy
      let filteredLawyers = transformedLawyers;
      
      if (search) {
        filteredLawyers = transformedLawyers.filter(lawyer => 
          lawyer.Name.toLowerCase().includes(search.toLowerCase()) ||
          lawyer.Specializations.toLowerCase().includes(search.toLowerCase()) ||
          (lawyer.Location && lawyer.Location.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      if (category) {
        filteredLawyers = filteredLawyers.filter(lawyer => 
          lawyer.Specializations.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      setLawyers(filteredLawyers);
      
    } catch (error) {
      console.error('❌ API Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Category filter
  const handleCategoryClick = (category) => {
    const categoryValue = category === 'All' ? '' : category;
    setSelectedCategory(categoryValue);
    setSearchTerm('');
    setTempSearchTerm('');
    
    if (categoryValue === '') {
      setLawyers(allLawyers);
    } else {
      const filtered = allLawyers.filter(lawyer => 
        lawyer.Specializations.toLowerCase().includes(categoryValue.toLowerCase())
      );
      setLawyers(filtered);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllLawyers();
  }, []);

  // When search or category changes
  useEffect(() => {
    if (searchTerm || selectedCategory) {
      fetchSearchedLawyers(searchTerm, selectedCategory);
    } else {
      setLawyers(allLawyers);
    }
  }, [searchTerm, selectedCategory]);

  const categories = [
    { name: 'All', icon: <FaGlobe /> },
    { name: 'Property', icon: <FaBuilding /> },
    { name: 'Family Law', icon: <FaUsers /> },
    { name: 'Criminal', icon: <FaGavel /> },
    { name: 'Corporate', icon: <FaBriefcase /> },
  ];

  return (
    <div className="home-container">
      {/* 1. Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            Find The Right Legal Help, Today.
          </motion.h1>
          <motion.div className="search-box" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <input 
              type="text" 
              placeholder="Search by name or specialty..."
              value={tempSearchTerm}
              onChange={(e) => setTempSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-btn" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              <FaSearch /> {isSearching ? 'Searching...' : 'Search'}
            </button>
          </motion.div>
        </div>
      </header>

      {/* 2. How It Works Section */}
      <section className="home-section works-section">
        <h2>How It Works</h2>
        <div className="works-grid">
          <div className="work-step">
            <div className="work-icon"><FaSearch /></div>
            <h3>1. Search for a Lawyer</h3>
            <p>Use our search and filters to find a lawyer by specialty and location.</p>
          </div>
          <div className="work-step">
            <div className="work-icon"><FaComments /></div>
            <h3>2. Connect & Chat</h3>
            <p>Send a message to discuss your case before you book an appointment.</p>
          </div>
          <div className="work-step">
            <div className="work-icon"><FaHandshake /></div>
            <h3>3. Book a Consultation</h3>
            <p>Book a secure audio/video call or an in-person meeting.</p>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="home-section categories-section">
        <h2>Categories</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <motion.div 
              key={index} 
              className={`category-card ${selectedCategory === (cat.name === 'All' ? '' : cat.name) ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="category-icon">{cat.icon}</div>
              <span>{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Available Lawyers Section */}
      <section className="home-section">
        <h2>Available Lawyers</h2>
        
        <div className="lawyer-list">
          {isSearching ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>🔍</div>
              <p style={{color: 'blue', fontSize: '18px', fontWeight: 'bold'}}>Searching for lawyers...</p>
            </div>
          ) : lawyers.length > 0 ? (
            <div>
              {(searchTerm || selectedCategory) && (
                <p style={{textAlign: 'center', color: 'green', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px'}}>
                  Found {lawyers.length} lawyer(s) 
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategory && ` in ${selectedCategory}`}
                </p>
              )}
              {lawyers.map((lawyer) => (
                <Link key={lawyer.UserID} to={`/profile/${lawyer.UserID}`} className="lawyer-card-link">
                  <div className="lawyer-card">
                    <img className="lawyer-avatar" src={`https://i.pravatar.cc/150?u=${lawyer.UserID}`} alt={lawyer.Name} />
                    <div className="lawyer-info">
                      <h3>{lawyer.Name}</h3>
                      <p><strong>Specializations:</strong> {lawyer.Specializations}</p>
                      <p><strong>Experience:</strong> {lawyer.Experience} years</p>
                      <p><strong>Location:</strong> {lawyer.Location}</p>
                      <p><strong>Consultation Fee:</strong> ₹{lawyer.ConsultationFee}</p>
                      <p><strong>Rating:</strong> ⭐ {lawyer.Rating}/5</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>❌</div>
              <p style={{color: 'orange', fontSize: '18px', fontWeight: 'bold'}}>
                No lawyers found matching your criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="home-section testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"Finding a reliable lawyer was so easy with NyayConnect. Highly recommended!"</p>
            <h4>- Priya S.</h4>
          </div>
          <div className="testimonial-card">
            <p>"As a young lawyer, this platform has been a game-changer for finding new clients."</p>
            <h4>- Adv. Rahul M.</h4>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;