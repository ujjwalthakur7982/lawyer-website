/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfilePage.css';

function EditProfilePage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ✅ Naya Azure Backend URL
  const AZURE_BACKEND_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token || !role) {
        setError("Aap logged in nahi hain.");
        setLoading(false);
        return;
      }

      // --- ✅ URL UPDATED TO AZURE ---
      const apiUrl = role === 'Lawyer' 
        ? `${AZURE_BACKEND_URL}/api/my-lawyer-profile` 
        : `${AZURE_BACKEND_URL}/api/user/profile`;

      try {
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          const profile = role === 'Lawyer' ? data.profile : data.user;
          if (role === 'Lawyer') {
            setFormData({
              bio: profile.Bio || '',
              specializations: profile.Specializations || '',
              experience: profile.Experience || '',
              city: profile.City || '',
              consultationFee: profile.ConsultationFee || ''
            });
          } else {
            setFormData({
              name: profile.name || '',
              phone: profile.phone || '',
              address: profile.address || ''
            });
          }
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError("Profile data load nahi ho paya.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const token = localStorage.getItem('token');
    const isLawyer = userRole === 'Lawyer';
    
    // --- ✅ URL UPDATED TO AZURE ---
    const apiUrl = isLawyer 
      ? `${AZURE_BACKEND_URL}/api/my-lawyer-profile` 
      : `${AZURE_BACKEND_URL}/api/user/profile`;
      
    const method = isLawyer ? 'POST' : 'PUT';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        alert("Profile successfully updated!");
        navigate('/my-account');
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err) {
      alert(err.message);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-container"><h2>Loading...</h2></div>;
  }

  const renderLawyerForm = () => (
    <>
      <div className="form-group"><label>About / Bio</label><textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>Specializations</label><input type="text" name="specializations" value={formData.specializations || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>Years of Experience</label><input type="number" name="experience" value={formData.experience || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>Consultation Fee (₹)</label><input type="number" name="consultationFee" value={formData.consultationFee || ''} onChange={handleChange} className="form-control" /></div>
    </>
  );

  const renderClientForm = () => (
    <>
      <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="form-control" /></div>
      <div className="form-group"><label>Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} className="form-control" /></div>
    </>
  );

  return (
    <div className="edit-profile-container">
      <h2>Edit Your Profile</h2>
      <p className="sub-heading">Keep your information up to date.</p>
      
      <form onSubmit={handleSubmit}>
        {userRole === 'Lawyer' ? renderLawyerForm() : renderClientForm()}
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="button" className="form-button cancel" onClick={() => navigate('/my-account')}>Cancel</button>
          <button type="submit" className="form-button save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfilePage;