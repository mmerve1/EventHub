// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    location: '',
    interests: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    profile_picture: ''
  });
  const [error, setError] = useState(null);
  const categories = ["Sanat", "Teknoloji", "Spor", "Sağlık"]; // Kategoriler


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.username || !formData.password) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/login');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">KAYIT OL</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        <label>İsim</label>
        <input
          type="text"
          name="first_name"
          placeholder="Enter your first name"
          value={formData.first_name}
          onChange={handleChange}
        />

        <label>Soy İsim</label>
        <input
          type="text"
          name="last_name"
          placeholder="Enter your last name"
          value={formData.last_name}
          onChange={handleChange}
        />
        
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Kullanıcı Adı</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
        />

        <label>Şifre</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        
        {/* Ek alanlar */}
        <label>Konum</label>
        <input type="text" name="location" placeholder="Enter your location" value={formData.location} onChange={handleChange} />
        
        <label>İlgi Alanları</label>
<select
  multiple
  name="interests"
  value={formData.interests}
  onChange={(e) =>
    setFormData({
      ...formData,
      interests: Array.from(e.target.selectedOptions, (opt) => opt.value),
    })
  }
  required
>
  <option value="" disabled>
    İlgi Alanlarınızı Seçin
  </option>
  {categories.map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>



        <label>Doğum Tarihi</label>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />

        <label>Cinsiyet</label>
        <input type="text" name="gender" placeholder="Enter your gender" value={formData.gender} onChange={handleChange} />

        <label>Telefon Numarası</label>
        <input type="text" name="phone_number" placeholder="Enter your phone number" value={formData.phone_number} onChange={handleChange} />

        <label>Profil Fotoğrafı URL</label>
        <input type="text" name="profile_picture" placeholder="Enter your profile picture URL" value={formData.profile_picture} onChange={handleChange} />

        <button type="submit" className="register-button">Register</button>
        
        <div className="register-section">
          <p>Hesabın var mı? </p>
          <p className="login-link" onClick={() => navigate("/login")}>Login</p>
        </div>
      </form>
    </div>
  );
};

export default Register;
